import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/middleware/withAuth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all todos (only for the authenticated user)
export const GET = withAuth(
  async (_request: NextRequest, _params: any, userId: string) => {
    try {
      const todos = await prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
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
      const newTodo = await prisma.todo.create({
        data: {
          ...body,
          userId,
        },
      });
      return NextResponse.json(newTodo, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to create todo" },
        { status: 500 }
      );
    }
  }
);
