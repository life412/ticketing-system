import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "auth_token";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || "super-secret-jwt-key-ticketing-system-2026-edge";
  return new TextEncoder().encode(secret);
}

function getRoleDashboardRoute(role?: string | null): string {
  switch (role) {
    case "MANAGER":
      return "/dashboard/manager";
    case "TECH":
      return "/dashboard/tech";
    case "EMPLOYEE":
    default:
      return "/dashboard/employee";
  }
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
      user = null;
    }
  }

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // 1. Unauthenticated users accessing protected routes -> redirect to /login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users accessing login or register -> redirect to role dashboard
  if (isAuthRoute && user) {
    const targetDashboard = getRoleDashboardRoute(user.role);
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 3. Role-Based Access Control for /dashboard routes
  if (user && isProtectedRoute) {
    // If accessing /dashboard root -> redirect to user's role dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(getRoleDashboardRoute(user.role), request.url));
    }

    // Protect /dashboard/manager
    if (pathname.startsWith("/dashboard/manager") && user.role !== "MANAGER") {
      return NextResponse.redirect(new URL(getRoleDashboardRoute(user.role), request.url));
    }

    // Protect /dashboard/tech
    if (pathname.startsWith("/dashboard/tech") && user.role !== "TECH" && user.role !== "MANAGER") {
      return NextResponse.redirect(new URL(getRoleDashboardRoute(user.role), request.url));
    }

    // Protect /dashboard/employee
    if (pathname.startsWith("/dashboard/employee") && user.role !== "EMPLOYEE" && user.role !== "MANAGER") {
      return NextResponse.redirect(new URL(getRoleDashboardRoute(user.role), request.url));
    }
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
