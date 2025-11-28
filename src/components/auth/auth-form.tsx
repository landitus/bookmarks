"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "@/lib/actions/auth";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (isSignUp) {
          await signup(formData);
        } else {
          await login(formData);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred");
      }
    });
  };

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-[15px] text-neutral-500 mt-2">
          {isSignUp
            ? "Start saving the things you love"
            : "Sign in to your pocket"}
        </p>
      </div>

      {/* Form */}
      <form action={handleSubmit} name={isSignUp ? "signup" : "login"}>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-700 text-sm">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isPending}
              autoComplete="username"
              className="h-11 rounded-xl border-neutral-200 bg-white/80 backdrop-blur-sm focus:border-neutral-400 focus:ring-neutral-400/20 placeholder:text-neutral-400"
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-neutral-700 text-sm">
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Your name"
                required
                disabled={isPending}
                autoComplete="name"
                className="h-11 rounded-xl border-neutral-200 bg-white/80 backdrop-blur-sm focus:border-neutral-400 focus:ring-neutral-400/20 placeholder:text-neutral-400"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-700 text-sm">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              disabled={isPending}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder={isSignUp ? "At least 6 characters" : "••••••••"}
              className="h-11 rounded-xl border-neutral-200 bg-white/80 backdrop-blur-sm focus:border-neutral-400 focus:ring-neutral-400/20 placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium shadow-lg shadow-neutral-900/10"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignUp ? "Creating account..." : "Signing in..."}
              </>
            ) : (
              <>{isSignUp ? "Create account" : "Sign in"}</>
            )}
          </Button>

          <button
            type="button"
            className="w-full text-sm text-neutral-500 hover:text-neutral-700 transition-colors py-2"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            disabled={isPending}
          >
            {isSignUp
              ? "Already have an account? Sign in →"
              : "Don't have an account? Sign up →"}
          </button>
        </div>
      </form>
    </div>
  );
}
