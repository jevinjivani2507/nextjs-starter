"use client";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TodoList from "./components/Todo";

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-end mb-8">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={() => router.push("/login")}>Login</Button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Get started with your amazing journey!
          </p>
        </div>

        <TodoList />
      </div>
    </div>
  );
}
