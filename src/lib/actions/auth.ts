"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Theme } from "@/lib/types";

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
  redirect("/everything");
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
  redirect("/everything");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateTheme(theme: Theme) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ theme })
    .eq("id", user.id);

  if (error) {
    console.error("Theme update error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
}

export async function getTheme(): Promise<Theme | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("theme")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Theme fetch error:", error);
    return null;
  }

  return (data?.theme as Theme) || null;
}

export async function getApiKey(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("api_key")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("API key fetch error:", error);
    return null;
  }

  return data?.api_key || null;
}

export async function regenerateApiKey(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Generate new UUID for API key
  const newApiKey = crypto.randomUUID();

  const { error } = await supabase
    .from("profiles")
    .update({ api_key: newApiKey })
    .eq("id", user.id);

  if (error) {
    console.error("API key regeneration error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return newApiKey;
}
