import { z } from "zod";
import { Role } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().trim().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  role: z.nativeEnum(Role, {
    message: "Please select a valid role.",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
