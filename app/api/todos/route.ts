import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import TodoModel from "@/models/Todo";
import { withMongoDb } from "@/middleware/mongodb";

// GET all todos
export const GET = withMongoDb(async () => {
  try {
    const todos = await TodoModel.find().sort({ createdAt: -1 });
    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch todos" },
      { status: 500 }
    );
  }
});

// POST new todo
export const POST = withMongoDb(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const newTodo = await TodoModel.create(body);
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create todo" },
      { status: 500 }
    );
  }
});
