import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "auth_token";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || "super-secret-jwt-key-ticketing-system-2026-edge";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let user: { id: string; email: string; role: string; name?: string } | null = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, getJwtSecretKey());
      user = verified.payload as unknown as {
        id: string;
        email: string;
        role: string;
        name?: string;
      };
    } catch (error) {
      // Invalid or expired token
      user = null;
    }
  }

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // Redirect unauthenticated user trying to access protected routes
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user trying to access login or register page
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Inject user details into request headers for downstream Server Components
  const requestHeaders = new Headers(request.headers);
  if (user) {
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email);
    requestHeaders.set("x-user-role", user.role);
    if (user.name) requestHeaders.set("x-user-name", user.name);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
