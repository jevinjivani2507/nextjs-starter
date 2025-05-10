import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import TodoModel from "@/models/Todo";
import { withMongoDb } from "@/middleware/mongodb";

// GET single todo
export const GET = withMongoDb(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const todo = await TodoModel.findById(params.id);

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
export const PUT = withMongoDb(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await request.json();

      const updatedTodo = await TodoModel.findByIdAndUpdate(
        params.id,
        { $set: { ...body } },
        { new: true, runValidators: true }
      );

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
export const DELETE = withMongoDb(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const deletedTodo = await TodoModel.findByIdAndDelete(params.id);

      if (!deletedTodo) {
        return NextResponse.json(
          { message: "Todo not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Todo deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to delete todo" },
        { status: 500 }
      );
    }
  }
);
