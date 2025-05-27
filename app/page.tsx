"use client";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TodoList from "@/components/Todo";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bg-secondary-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex justify-end">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <Button
                onClick={handleLogout}
                variant="neutral"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={() => router.push("/login")}>Login</Button>
          )}
        </div>
        <div className="shadow-shadow rounded-base bg-background min-h-[500px] border-2 p-4">
          <div className="mb-8 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Try out the Todo App</h1>
            <p className="text-gray-600">This is a simple todo app</p>
          </div>

          <TodoList />
        </div>
      </div>
    </div>
  );
}
