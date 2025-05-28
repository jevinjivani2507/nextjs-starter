import { auth } from "@/app/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();

    console.log("session", session);

    // Only these paths should be public
    const publicPaths = ["/", "/api/auth", "/auth/error"];
    const isPublicPath = publicPaths.some((path) =>
      request.nextUrl.pathname.endsWith(path),
    );

    console.log("isPublicPath", isPublicPath);

    // Allow static files and API routes
    if (
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/api/") ||
      request.nextUrl.pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // If user is not logged in and trying to access any non-public route
    if (!session && !isPublicPath) {
      // Redirect to home page
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If user is logged in and trying to access login page, redirect to todo
    if (session && request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/todo", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
