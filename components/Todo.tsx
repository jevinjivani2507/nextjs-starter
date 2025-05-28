"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import {
  useAddTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
} from "@/hooks/useTodoMutation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

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

const TodoSkeleton = () => {
  return <Skeleton className="h-14 w-full" />;
};

export default function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const { todos, isTodosLoading, errorInFetchingTodos } = useTodos();

  const { mutate: addTodo } = useAddTodoMutation();

  const { mutate: toggleTodo } = useToggleTodoMutation();

  const { mutate: deleteTodoMutation } = useDeleteTodoMutation();

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
          {isTodosLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <TodoSkeleton key={index} />
              ))
            : todos?.data.map((todo: Todo) => (
                <motion.li
                  key={todo.id}
                  className="rounded-base bg-secondary-background flex items-center gap-3 border-2 p-3 hover:shadow-none"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() =>
                      handleToggleTodo(todo.id, todo.completed)
                    }
                  />
                  <motion.span
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
