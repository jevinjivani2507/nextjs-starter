"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const todoVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

export default function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();
  const { todos, isTodosLoading, errorInFetchingTodos } = useTodos();

  const { mutate: addTodo } = useMutation({
    mutationFn: async (todo: Omit<Todo, "id">) => {
      const response = await axios.post("/api/todos", todo);
      return response.data;
    },
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (old: any) => ({
        ...old,
        data: [{ id: "temp-" + Date.now(), ...newTodo }, ...old.data],
      }));

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
      toast.error("Failed to add todo");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["todos"], (old: any) => ({
        ...old,
        data: old.data.map((todo: Todo) =>
          todo.id.startsWith("temp-") ? data : todo,
        ),
      }));
      toast.success("Todo added successfully");
    },
  });

  const { mutate: toggleTodo } = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => {
      const response = await axios.put(`/api/todos/${id}`, { completed });
      return response.data;
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (old: any) => ({
        ...old,
        data: old.data.map((todo: Todo) =>
          todo.id === id ? { ...todo, completed } : todo,
        ),
      }));

      return { previousTodos };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
      toast.error("Failed to update todo");
    },
    onSuccess: () => {
      toast.success("Todo updated successfully");
    },
  });

  const { mutate: deleteTodoMutation } = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/todos/${id}`);
      return response.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (old: any) => ({
        ...old,
        data: old.data.filter((todo: Todo) => todo.id !== id),
      }));

      return { previousTodos };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
      toast.error("Failed to delete todo");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addTodo({ title: newTodo, completed: false });
    setNewTodo("");
  };

  const handleToggleTodo = (id: string, currentCompleted: boolean) => {
    toggleTodo({ id, completed: !currentCompleted });
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodoMutation(id);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6">
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
          />
          <Button type="submit" variant="noShadow">
            Add
          </Button>
        </motion.div>
      </form>

      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {todos?.data.map((todo: Todo) => (
            <motion.li
              key={todo.id}
              variants={todoVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              layout
              className="rounded-base bg-secondary-background flex items-center gap-3 border-2 p-3 hover:shadow-none"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() =>
                  handleToggleTodo(todo.id, todo.completed)
                }
              />
              <motion.span
                layout
                animate={{
                  opacity: todo.completed ? 0.6 : 1,
                  scale: todo.completed ? 0.99 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={`flex-1 ${
                  todo.completed ? "text-gray-500 line-through" : ""
                }`}
              >
                {todo.title}
              </motion.span>
              <Button
                variant="noShadow"
                size="icon"
                onClick={() => handleDeleteTodo(todo.id)}
              >
                <X />
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
