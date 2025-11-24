"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Item } from "@/lib/types";

export async function getQueueItems(): Promise<Item[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("status", "queue")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching queue items:", error);
    return [];
  }

  return data as Item[];
}

export async function getLibraryItems(): Promise<Item[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("status", "library")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching library items:", error);
    return [];
  }

  return data as Item[];
}

