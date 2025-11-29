"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Item, ItemType } from "@/lib/types";

// Metascraper setup
import metascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";

const scraper = metascraper([
  metascraperDescription(),
  metascraperImage(),
  metascraperTitle(),
  metascraperUrl(),
]);

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get all non-archived items (Everything view)
 */
export async function getItems(): Promise<Item[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching items:", error);
    return [];
  }

  return data as Item[];
}

/**
 * Get items marked as "Later" (to watch/read later)
 */
export async function getLaterItems(): Promise<Item[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("is_later", true)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching later items:", error);
    return [];
  }

  return data as Item[];
}

/**
 * Get items marked as "Favorites"
 */
export async function getFavoriteItems(): Promise<Item[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("is_favorite", true)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorite items:", error);
    return [];
  }

  return data as Item[];
}

// =============================================================================
// CREATE OPERATIONS
// =============================================================================

export async function createItem(
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const url = formData.get("url") as string;

  if (!url) {
    return { success: false, message: "URL is required" };
  }

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn("No authenticated user - using service role for development");
  }

  // Check if URL already exists for this user
  const duplicateQuery = supabase.from("items").select("id").eq("url", url);

  if (user?.id) {
    duplicateQuery.eq("user_id", user.id);
  } else {
    duplicateQuery.is("user_id", null);
  }

  const { data: existingItem } = await duplicateQuery.maybeSingle();

  if (existingItem) {
    return { success: false, message: "This bookmark already exists" };
  }

  // Scrape metadata
  let title = url;
  let description = null;
  let image_url = null;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const metadata = await scraper({ html, url });

    if (metadata.title) title = metadata.title;
    if (metadata.description) description = metadata.description;
    if (metadata.image) image_url = metadata.image;
  } catch (e) {
    console.error("Failed to scrape metadata:", e);
  }

  // Infer type roughly from extension or domain
  let type: ItemType = "article";
  if (url.includes("youtube.com") || url.includes("vimeo")) type = "video";
  if (url.match(/\.(jpg|jpeg|png|gif)$/i)) type = "image";
  if (url.includes("twitter.com") || url.includes("x.com")) type = "thread";

  const { error } = await supabase.from("items").insert({
    url,
    title,
    description,
    image_url,
    type,
    is_later: false,
    is_favorite: false,
    is_archived: false,
    user_id: user?.id,
  });

  if (error) {
    console.error("Error creating item:", error);
    return {
      success: false,
      message: `Failed to create item: ${error.message}`,
    };
  }

  revalidateAllPaths();
  return { success: true };
}

// =============================================================================
// TOGGLE OPERATIONS
// =============================================================================

/**
 * Toggle "Later" flag on an item
 */
export async function toggleLater(id: string): Promise<{ is_later: boolean }> {
  const supabase = await createClient();

  // Get current state
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("is_later")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    throw new Error("Failed to fetch item");
  }

  // Toggle the flag
  const newValue = !item.is_later;
  const { error } = await supabase
    .from("items")
    .update({ is_later: newValue })
    .eq("id", id);

  if (error) {
    console.error("Error toggling later:", error);
    throw new Error("Failed to toggle later status");
  }

  revalidateAllPaths();
  return { is_later: newValue };
}

/**
 * Toggle "Favorite" flag on an item
 */
export async function toggleFavorite(
  id: string
): Promise<{ is_favorite: boolean }> {
  const supabase = await createClient();

  // Get current state
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("is_favorite")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    throw new Error("Failed to fetch item");
  }

  // Toggle the flag
  const newValue = !item.is_favorite;
  const { error } = await supabase
    .from("items")
    .update({ is_favorite: newValue })
    .eq("id", id);

  if (error) {
    console.error("Error toggling favorite:", error);
    throw new Error("Failed to toggle favorite status");
  }

  revalidateAllPaths();
  return { is_favorite: newValue };
}

/**
 * Archive an item (removes from Everything view)
 */
export async function archiveItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({ is_archived: true })
    .eq("id", id);

  if (error) {
    console.error("Error archiving item:", error);
    throw new Error("Failed to archive item");
  }

  revalidateAllPaths();
}

/**
 * Unarchive an item (restore to Everything view)
 */
export async function unarchiveItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({ is_archived: false })
    .eq("id", id);

  if (error) {
    console.error("Error unarchiving item:", error);
    throw new Error("Failed to unarchive item");
  }

  revalidateAllPaths();
}

/**
 * Delete an item permanently
 */
export async function deleteItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    console.error("Error deleting item:", error);
    throw new Error("Failed to delete item");
  }

  revalidateAllPaths();
}

// =============================================================================
// HELPERS
// =============================================================================

function revalidateAllPaths() {
  revalidatePath("/everything");
  revalidatePath("/later");
  revalidatePath("/favorites");
}
