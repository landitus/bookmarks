"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
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
 * Get Inbox items (not yet triaged)
 * Inbox: is_kept = false AND is_archived = false
 */
export async function getInboxItems(): Promise<Item[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("is_kept", false)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inbox items:", error);
    return [];
  }

  return data as Item[];
}

/**
 * Get Library items (kept/saved items)
 * Library: is_kept = true AND is_archived = false
 */
export async function getLibraryItems(
  favoritesOnly: boolean = false
): Promise<Item[]> {
  const supabase = await createClient();

  let query = supabase
    .from("items")
    .select("*")
    .eq("is_kept", true)
    .eq("is_archived", false);

  if (favoritesOnly) {
    query = query.eq("is_favorite", true);
  }

  // Sort by kept_at (when item was added to Library), newest first
  const { data, error } = await query.order("kept_at", {
    ascending: false,
    nullsFirst: false,
  });

  if (error) {
    console.error("Error fetching library items:", error);
    return [];
  }

  return data as Item[];
}

/**
 * Get Archived items (discarded/soft-deleted)
 * Archive: is_archived = true
 */
export async function getArchivedItems(): Promise<Item[]> {
  const supabase = await createClient();

  // Sort by archived_at (when item was archived), newest first
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("is_archived", true)
    .order("archived_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Error fetching archived items:", error);
    return [];
  }

  return data as Item[];
}

/**
 * @deprecated Use getInboxItems or getLibraryItems instead
 * Get all non-archived items (for backwards compatibility)
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

  // Scrape metadata with timeout
  let title = url;
  let description = null;
  let image_url = null;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Portable/1.0; +https://portable.app)",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout for fast response
    });
    const html = await response.text();
    const metadata = await scraper({ html, url });

    if (metadata.title) title = metadata.title;
    if (metadata.description) description = metadata.description;
    if (metadata.image) image_url = metadata.image;
  } catch (e) {
    console.error("Failed to scrape metadata:", e);
    // Continue with URL as title - still save the item
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
    is_kept: false, // New items go to Inbox
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
// TRIAGE OPERATIONS
// =============================================================================

/**
 * Keep an item (move from Inbox to Library)
 * Sets kept_at to current timestamp for sorting
 */
export async function keepItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({
      is_kept: true,
      kept_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error keeping item:", error);
    throw new Error("Failed to keep item");
  }

  revalidateAllPaths();
}

/**
 * Discard an item (move to Archive)
 * Sets archived_at to current timestamp for sorting
 */
export async function discardItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({
      is_archived: true,
      archived_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error discarding item:", error);
    throw new Error("Failed to discard item");
  }

  revalidateAllPaths();
}

/**
 * Restore an item from Archive
 * Returns to Inbox if is_kept = false, or Library if is_kept = true
 * Clears archived_at timestamp
 */
export async function restoreItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({
      is_archived: false,
      archived_at: null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error restoring item:", error);
    throw new Error("Failed to restore item");
  }

  revalidateAllPaths();
}

// =============================================================================
// TOGGLE OPERATIONS
// =============================================================================

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
 * Archive an item (alias for discardItem, for backwards compatibility)
 */
export async function archiveItem(id: string): Promise<void> {
  return discardItem(id);
}

/**
 * Unarchive an item (alias for restoreItem, for backwards compatibility)
 */
export async function unarchiveItem(id: string): Promise<void> {
  return restoreItem(id);
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

/**
 * Update an item's title, URL, or description
 */
export async function updateItem(
  id: string,
  data: { title?: string; url?: string; description?: string | null }
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("items").update(data).eq("id", id);

  if (error) {
    console.error("Error updating item:", error);
    return { success: false, message: error.message };
  }

  revalidateAllPaths();
  return { success: true };
}

/**
 * Refresh an item's content extraction
 * Resets processing fields and sets status to "pending" to trigger reprocessing
 */
export async function refreshContent(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({
      processing_status: "pending",
      content: null,
      word_count: null,
      reading_time: null,
      author: null,
      publish_date: null,
      ai_summary: null,
      ai_content_type: null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error refreshing content:", error);
    throw new Error("Failed to refresh content");
  }

  // Trigger background processing by calling the API
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("url, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    console.error("Error fetching item for refresh:", fetchError);
    throw new Error("Failed to fetch item");
  }

  // Get user's API key for authentication
  const { data: profile } = await supabase
    .from("profiles")
    .select("api_key")
    .eq("id", item.user_id)
    .single();

  if (profile?.api_key) {
    // Trigger processing via after() to ensure fetch completes
    const vercelUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null;
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      vercelUrl ||
      "http://localhost:3000";

    // Use after() to ensure the fetch completes even after server action returns
    after(async () => {
      try {
        await fetch(`${baseUrl}/api/items/reprocess`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${profile.api_key}`,
          },
          body: JSON.stringify({ itemId: id }),
          signal: AbortSignal.timeout(60000), // 60s timeout for the trigger request (includes route compilation in dev)
        });
      } catch (e) {
        console.error("Error triggering reprocess:", e);
      }
    });
  }

  revalidateAllPaths();
  revalidatePath(`/items/${id}`);
}

/**
 * Check the processing status of an item
 */
export async function getItemProcessingStatus(
  id: string
): Promise<{ status: string; hasContent: boolean }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("processing_status, content")
    .eq("id", id)
    .single();

  if (error || !data) {
    return { status: "unknown", hasContent: false };
  }

  return {
    status: data.processing_status || "unknown",
    hasContent: !!data.content && data.content.length > 100,
  };
}

/**
 * Mark an item's processing as timed out (failed)
 * Called when client-side polling times out
 */
export async function markProcessingTimedOut(id: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("items")
    .update({
      processing_status: "failed",
      processing_error: "Content extraction timed out",
    })
    .eq("id", id)
    .eq("processing_status", "pending"); // Only update if still pending

  revalidateAllPaths();
}

// =============================================================================
// HELPERS
// =============================================================================

function revalidateAllPaths() {
  revalidatePath("/inbox");
  revalidatePath("/library");
  revalidatePath("/archive");
  // Keep old paths for backwards compatibility during migration
  revalidatePath("/everything");
  revalidatePath("/later");
  revalidatePath("/favorites");
}
