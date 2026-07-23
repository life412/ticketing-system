import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { Role } from "@prisma/client";

export const AUTH_COOKIE_NAME = "auth_token";

export interface UserJwtPayload {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
}

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || "super-secret-jwt-key-ticketing-system-2026-edge";
  return new TextEncoder().encode(secret);
}

/**
 * Sign a JWT token using `jose` for Edge Runtime compatibility
 */
export async function signJWT(
  payload: UserJwtPayload,
  expiresIn: string = "7d"
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecretKey());
}

/**
 * Verify and decode a JWT token using `jose`
 */
export async function verifyJWT(token: string): Promise<UserJwtPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    const payload = verified.payload as unknown as UserJwtPayload;
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Set HTTP-Only authentication cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

/**
 * Get HTTP-Only authentication cookie value
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

/**
 * Remove HTTP-Only authentication cookie
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Helper to get currently logged in user context in Server Components or Server Actions
 */
export async function getCurrentUser(): Promise<UserJwtPayload | null> {
  // First check middleware request headers
  const headerList = headers();
  const headerId = headerList.get("x-user-id");
  const headerEmail = headerList.get("x-user-email");
  const headerRole = headerList.get("x-user-role") as Role | null;

  if (headerId && headerEmail && headerRole) {
    return {
      id: headerId,
      email: headerEmail,
      role: headerRole,
    };
  }

  // Fallback to verifying cookie directly
  const token = await getAuthCookie();
  if (!token) return null;
  const decoded = await verifyJWT(token);
  if (!decoded) return null;

  // Optional: verify user exists in DB to prevent foreign key errors if DB was wiped
  try {
    const { prisma } = await import("@/lib/prisma");
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true },
    });
    if (!dbUser) return null;
  } catch (e) {
    // Ignore db errors and proceed with jwt if prisma fails to load
  }

  return decoded;
}
