"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  redirect("/inbox");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    fullName: formData.get("full_name") as string,
  };

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      },
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    console.error("Signup error:", error);
    throw new Error(error.message);
  }

  console.log("Signup response:", {
    user: authData.user?.id,
    session: authData.session?.access_token ? "exists" : "null",
    identities: authData.user?.identities?.length,
  });

  // Check if user has an active session (email confirmation disabled)
  if (!authData.session) {
    throw new Error(
      "Please check your email to confirm your account before signing in"
    );
  }

  revalidatePath("/", "layout");
  redirect("/inbox");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
