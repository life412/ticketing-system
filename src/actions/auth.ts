"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signJWT, setAuthCookie, removeAuthCookie, UserJwtPayload } from "@/lib/auth";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: UserJwtPayload;
}

/**
 * Server Action for User Registration
 */
export async function registerAction(input: RegisterInput): Promise<AuthActionResult> {
  try {
    const validation = registerSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid registration input.",
      };
    }

    const { name, email, password, role } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
      },
    });

    const userPayload: UserJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = await signJWT(userPayload);
    await setAuthCookie(token);

    return {
      success: true,
      user: userPayload,
    };
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred during registration.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action for User Login
 */
export async function loginAction(input: LoginInput): Promise<AuthActionResult> {
  try {
    const validation = loginSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid login input.",
      };
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    const userPayload: UserJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = await signJWT(userPayload);
    await setAuthCookie(token);

    return {
      success: true,
      user: userPayload,
    };
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred during login.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action for User Logout
 */
export async function logoutAction(): Promise<void> {
  await removeAuthCookie();
  redirect("/login");
}
