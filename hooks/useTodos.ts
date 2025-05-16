import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTodos = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["todos"],
    queryFn: () => axios.get("/api/todos"),
  });

  return {
    todos: data,
    isTodosLoading: isLoading,
    errorInFetchingTodos: error,
  };
};
