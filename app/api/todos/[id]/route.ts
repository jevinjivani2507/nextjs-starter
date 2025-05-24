import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/middleware/withAuth";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// GET single todo
export const GET = withAuth(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    userId: string
  ) => {
    try {
      const todo = await prisma.todo.findFirst({
        where: {
          id: (await params).id,
          userId,
        },
      });

      if (!todo) {
        return NextResponse.json(
          { message: "Todo not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(todo, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to fetch todo" },
        { status: 500 }
      );
    }
  }
);

// PUT (update) todo
export const PUT = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    userId: string
  ) => {
    try {
      const body = await request.json();

      const updatedTodo = await prisma.todo.update({
        where: {
          id: (await params).id,
          userId,
        },
        data: body,
      });

      if (!updatedTodo) {
        return NextResponse.json(
          { message: "Todo not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedTodo, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to update todo" },
        { status: 500 }
      );
    }
  }
);

// DELETE todo
export const DELETE = withAuth(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    userId: string
  ) => {
    try {
      await prisma.todo.delete({
        where: {
          id: (await params).id,
          userId,
        },
      });

      return NextResponse.json(
        { message: "Todo deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return NextResponse.json(
          { message: "Todo not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: "Failed to delete todo" },
        { status: 500 }
      );
    }
  }
);
