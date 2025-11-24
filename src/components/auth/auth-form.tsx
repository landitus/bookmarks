"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </CardTitle>
        <CardDescription className="text-center">
          {isSignUp
            ? "Enter your details to create your account"
            : "Sign in to access your bookmarks"}
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit} name={isSignUp ? "signup" : "login"}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isPending}
              autoComplete="username"
            />
          </div>
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                required
                disabled={isPending}
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              disabled={isPending}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder={isSignUp ? "At least 6 characters" : "••••••••"}
            />
            {isSignUp && (
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignUp ? "Creating account..." : "Signing in..."}
              </>
            ) : (
              <>{isSignUp ? "Create Account" : "Sign In"}</>
            )}
          </Button>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            disabled={isPending}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
