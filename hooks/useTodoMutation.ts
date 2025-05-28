import { useGenericMutation } from "./useGenericMutation";
import { useQueryClient } from "@tanstack/react-query";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

type TodoInput = Omit<Todo, "id">;
type TodoUpdateInput = { id: string; completed: boolean };

interface UseTodoMutationOptions {
  onSuccess?: (data: Todo) => void;
}

const todoMeta = {
  queryKey: ["todos"] as const,
} as const;

export const useAddTodoMutation = ({
  onSuccess,
}: UseTodoMutationOptions = {}) => {
  const queryClient = useQueryClient();

  return useGenericMutation<Todo, TodoInput>({
    meta: {
      ...todoMeta,
      method: "POST",
      url: "/api/todos",
      onSuccessMessage: "Todo added successfully",
      onErrorMessage: "Failed to add todo",
      optimisticUpdate: (old: any, variables: TodoInput) => ({
        ...old,
        data: [{ id: "temp-" + Date.now(), ...variables }, ...old.data],
      }),
    },
    onSuccess: (data) => {
      queryClient.setQueryData(todoMeta.queryKey, (old: any) => ({
        ...old,
        data: old.data.map((todo: Todo) =>
          todo.id.startsWith("temp-") ? data : todo,
        ),
      }));
      onSuccess?.(data);
    },
  });
};

export const useToggleTodoMutation = ({
  onSuccess,
}: UseTodoMutationOptions = {}) => {
  return useGenericMutation<Todo, TodoUpdateInput>({
    meta: {
      ...todoMeta,
      method: "PUT",
      url: (variables) => `/api/todos/${variables.id}`,
      onSuccessMessage: "Todo updated successfully",
      onErrorMessage: "Failed to update todo",
      transformVariables: ({ completed }) => ({ completed }),
      optimisticUpdate: (old: any, variables: TodoUpdateInput) => ({
        ...old,
        data: old.data.map((todo: Todo) =>
          todo.id === variables.id
            ? { ...todo, completed: variables.completed }
            : todo,
        ),
      }),
    },
    onSuccess,
  });
};

export const useDeleteTodoMutation = ({
  onSuccess,
}: UseTodoMutationOptions = {}) => {
  return useGenericMutation<Todo, string>({
    meta: {
      ...todoMeta,
      method: "DELETE",
      url: (id) => `/api/todos/${id}`,
      onSuccessMessage: "Todo deleted successfully",
      onErrorMessage: "Failed to delete todo",
      optimisticUpdate: (old: any, id: string) => ({
        ...old,
        data: old.data.filter((todo: Todo) => todo.id !== id),
      }),
    },
    onSuccess,
  });
};
