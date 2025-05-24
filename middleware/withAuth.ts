import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/auth/auth";
import db from "@/lib/db";

export type AuthenticatedHandlerFunction<T = any> = (
  req: NextRequest,
  params: T,
  userId: string
) => Promise<NextResponse>;

export function withAuth<T>(handler: AuthenticatedHandlerFunction<T>) {
  return async (req: NextRequest, params: T) => {
    try {
      const session = await auth();

      console.log("session", session);

      if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      console.log("session.user.email", session.user.email);

      const user = await db.user.findUnique({
        where: { email: session.user.email || "" },
      });

      console.log("user", user);

      if (!user) {
        return NextResponse.json(
          { message: "User not found here" },
          { status: 404 }
        );
      }

      return handler(req, params, user.id);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { message: "Internal Server Error Auth" },
        { status: 500 }
      );
    }
  };
}
