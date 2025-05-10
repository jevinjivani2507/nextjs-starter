import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";

export type HandlerFunction<T = any> = (
  req: NextRequest,
  params: T
) => Promise<NextResponse>;

export function withMongoDb<T>(
  handler: HandlerFunction<T>
): HandlerFunction<T> {
  return async (req: NextRequest, params: T) => {
    try {
      await connectDB();
      return await handler(req, params);
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
