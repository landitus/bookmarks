import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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

type ItemType = "video" | "article" | "thread" | "image";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper to create JSON response with CORS headers
function jsonResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

// Create a Supabase client with service role for API access
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Authenticate request via Bearer token (api_key from profiles)
 */
async function authenticateRequest(
  request: NextRequest
): Promise<{ userId: string } | { error: string; status: number }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const apiKey = authHeader.slice(7); // Remove "Bearer " prefix

  if (!apiKey) {
    return { error: "API key is required", status: 401 };
  }

  const supabase = createServiceClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("api_key", apiKey)
    .single();

  if (error || !profile) {
    return { error: "Invalid API key", status: 401 };
  }

  return { userId: profile.id };
}

/**
 * GET /api/items?url=<encoded_url> - Check if a bookmark exists
 *
 * Headers:
 *   Authorization: Bearer <api_key>
 *
 * Response:
 *   { exists: true, item: Item } | { exists: false }
 */
export async function GET(request: NextRequest) {
  // Authenticate
  const auth = await authenticateRequest(request);

  if ("error" in auth) {
    return jsonResponse({ exists: false, error: auth.error }, auth.status);
  }

  const { userId } = auth;

  // Get URL from query params
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return jsonResponse(
      { exists: false, error: "URL parameter is required" },
      400
    );
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return jsonResponse({ exists: false, error: "Invalid URL format" }, 400);
  }

  const supabase = createServiceClient();

  // Check for existing item
  const { data: existingItem, error } = await supabase
    .from("items")
    .select("id, url, title, created_at")
    .eq("url", url)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error checking for existing item:", error);
    return jsonResponse(
      { exists: false, error: "Failed to check bookmark" },
      500
    );
  }

  if (existingItem) {
    return jsonResponse({ exists: true, item: existingItem }, 200);
  }

  return jsonResponse({ exists: false }, 200);
}

/**
 * POST /api/items - Create a new bookmark
 *
 * Headers:
 *   Authorization: Bearer <api_key>
 *
 * Body:
 *   { url: string }
 *
 * Response:
 *   { success: true, item: Item } | { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  // Authenticate
  const auth = await authenticateRequest(request);

  if ("error" in auth) {
    return jsonResponse({ success: false, error: auth.error }, auth.status);
  }

  const { userId } = auth;

  // Parse body
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }

  const { url } = body;

  if (!url) {
    return jsonResponse({ success: false, error: "URL is required" }, 400);
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return jsonResponse({ success: false, error: "Invalid URL format" }, 400);
  }

  const supabase = createServiceClient();

  // Check for duplicate
  const { data: existingItem } = await supabase
    .from("items")
    .select("id")
    .eq("url", url)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingItem) {
    return jsonResponse(
      { success: false, error: "This bookmark already exists" },
      409
    );
  }

  // Scrape metadata
  let title = url;
  let description: string | null = null;
  let image_url: string | null = null;

  try {
    // Special handling for YouTube - use oEmbed API
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        url
      )}&format=json`;
      const oembedRes = await fetch(oembedUrl);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        title = oembed.title || title;
        image_url = oembed.thumbnail_url || null;
        description = oembed.author_name ? `By ${oembed.author_name}` : null;
      }
    }
    // Special handling for Vimeo
    else if (url.includes("vimeo.com/")) {
      const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
        url
      )}`;
      const oembedRes = await fetch(oembedUrl);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        title = oembed.title || title;
        image_url = oembed.thumbnail_url || null;
        description = oembed.author_name ? `By ${oembed.author_name}` : null;
      }
    }
    // Default: use metascraper
    else {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; Portable/1.0; +https://portable.app)",
        },
      });
      const html = await response.text();
      const metadata = await scraper({ html, url });

      if (metadata.title) title = metadata.title;
      if (metadata.description) description = metadata.description;
      if (metadata.image) image_url = metadata.image;
    }
  } catch (e) {
    console.error("Failed to scrape metadata:", e);
    // Continue with URL as title
  }

  // Infer type from URL
  let type: ItemType = "article";
  if (url.includes("youtube.com") || url.includes("vimeo")) type = "video";
  if (url.match(/\.(jpg|jpeg|png|gif)$/i)) type = "image";
  if (url.includes("twitter.com") || url.includes("x.com")) type = "thread";

  // Insert item
  const { data: item, error: insertError } = await supabase
    .from("items")
    .insert({
      url,
      title,
      description,
      image_url,
      type,
      is_later: false,
      is_favorite: false,
      is_archived: false,
      user_id: userId,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating item:", insertError);
    return jsonResponse(
      { success: false, error: "Failed to create bookmark" },
      500
    );
  }

  return jsonResponse({ success: true, item }, 201);
}

/**
 * OPTIONS /api/items - Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
