"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

export default function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();
  const { todos, isTodosLoading, errorInFetchingTodos } = useTodos();

  const { mutate: addTodo } = useMutation({
    mutationFn: async (todo: Omit<Todo, "_id">) => {
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
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {todos?.data.map((todo: Todo) => (
          <li
            key={todo._id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo._id, todo.completed)}
              className="w-5 h-5 border-2 rounded focus:ring-blue-500"
            />
            <span
              className={`flex-1 ${
                todo.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {todo.title}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo._id)}
              className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
