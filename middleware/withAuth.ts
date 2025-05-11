import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/auth/auth";
import { withMongoDb, HandlerFunction } from "./mongodb";
import UserModel from "@/models/User";

export type AuthenticatedHandlerFunction<T = any> = (
  req: NextRequest,
  params: T,
  userId: string
) => Promise<NextResponse>;

export function withAuth<T>(
  handler: AuthenticatedHandlerFunction<T>
): HandlerFunction<T> {
  return withMongoDb(async (req: NextRequest, params: T) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      // Get user from database
      const user = await UserModel.findOne({ email: session.user.email });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return handler(req, params, user._id.toString());
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
