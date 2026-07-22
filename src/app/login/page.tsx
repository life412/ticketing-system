"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ticket, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/actions/auth";
import { getRoleDashboardRoute } from "@/lib/routes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await loginAction(data);
      if (!result.success || !result.user) {
        setServerError(result.error || "Login failed. Please check your credentials.");
      } else {
        const targetRoute = callbackUrl !== "/dashboard" ? callbackUrl : getRoleDashboardRoute(result.user.role);
        router.push(targetRoute);
        router.refresh();
      }
    } catch (err) {
      console.error("Login catch error:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
          <Ticket className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
        <p className="text-sm text-slate-400">Sign in to your Ticketing System account</p>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="name@company.com"
              className="pl-9"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-9"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-400 hover:underline"
        >
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
