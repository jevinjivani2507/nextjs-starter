import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import TodoModel from "@/models/Todo";
import { withAuth } from "@/middleware/withAuth";

// GET all todos (only for the authenticated user)
export const GET = withAuth(
  async (_request: NextRequest, _params: any, userId: string) => {
    try {
      const todos = await TodoModel.find({ userId }).sort({ createdAt: -1 });
      return NextResponse.json(todos, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to fetch todos" },
        { status: 500 }
      );
    }
  }
);

// POST new todo
export const POST = withAuth(
  async (request: NextRequest, _params: any, userId: string) => {
    try {
      const body = await request.json();
      const newTodo = await TodoModel.create({ ...body, userId });
      return NextResponse.json(newTodo, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to create todo" },
        { status: 500 }
      );
    }
  }
);
