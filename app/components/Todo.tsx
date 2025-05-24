"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";

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
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const todoVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const checkboxVariants: Variants = {
  checked: {
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
  unchecked: { scale: 1 },
  tap: { scale: 0.85 },
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
    onMutate: () => {
      toast.loading("Adding todo...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"], exact: true });
      toast.success("Todo added successfully");
    },
    onError: () => {
      toast.error("Failed to add todo");
    },
    onSettled: () => {
      toast.dismiss();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"], exact: true });
    },
  });

  const { mutate: deleteTodoMutation } = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/todos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"], exact: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addTodo({ title: newTodo, completed: false });
    setNewTodo("");
    toast.success("Todo added successfully");
  };

  const handleToggleTodo = (id: string, currentCompleted: boolean) => {
    toggleTodo({ id, completed: !currentCompleted });
    toast.success("Todo updated successfully");
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodoMutation(id);
    toast.success("Todo deleted successfully");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-6">
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </motion.button>
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
              className="flex items-center gap-3 p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <motion.div
                variants={checkboxVariants}
                initial="unchecked"
                animate={todo.completed ? "checked" : "unchecked"}
                whileTap="tap"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id, todo.completed)}
                  className="w-5 h-5 border-2 rounded focus:ring-blue-500 transition-colors"
                />
              </motion.div>
              <motion.span
                layout
                animate={{
                  opacity: todo.completed ? 0.5 : 1,
                  scale: todo.completed ? 0.98 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className={`flex-1 ${
                  todo.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.title}
              </motion.span>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => handleDeleteTodo(todo.id)}
                className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
              >
                <X />
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
