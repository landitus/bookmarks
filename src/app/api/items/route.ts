import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";

// Metascraper setup
import metascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";

// Shared utilities
import {
  corsHeaders,
  jsonResponse,
  createServiceClient,
  authenticateRequest,
} from "@/lib/api/helpers";
import {
  detectTypeFromUrl,
  processItemInBackground,
} from "@/lib/api/item-processing";
import { isLikelyArticle } from "@/lib/services/content-extractor";

const scraper = metascraper([
  metascraperDescription(),
  metascraperImage(),
  metascraperTitle(),
  metascraperUrl(),
]);

/**
 * GET /api/items?url=<encoded_url> - Check if a bookmark exists
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    if ("error" in auth) {
      return jsonResponse({ exists: false, error: auth.error }, auth.status);
    }

  const { userId } = auth;
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return jsonResponse(
      { exists: false, error: "URL parameter is required" },
      400
    );
  }

  try {
    new URL(url);
  } catch {
    return jsonResponse({ exists: false, error: "Invalid URL format" }, 400);
  }

  const supabase = createServiceClient();

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
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("[API] GET /api/items error:", errorMsg, e);
    return jsonResponse({ exists: false, error: `Server error: ${errorMsg}` }, 500);
  }
}

/**
 * POST /api/items - Create a new bookmark (FAST - returns immediately)
 *
 * Background processing handles content extraction and AI.
 * The item appears instantly with processing_status: 'pending'.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);

  if ("error" in auth) {
    return jsonResponse({ success: false, error: auth.error }, auth.status);
  }

  const { userId } = auth;

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

  try {
    new URL(url);
  } catch {
    return jsonResponse({ success: false, error: "Invalid URL format" }, 400);
  }

  // Helper for timestamped logging
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [API] [POST /api/items] ${message}`);
  };

  log(`Creating bookmark: ${url}`);

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

  // ==========================================================================
  // FAST PATH: Basic metadata only (oEmbed for videos, metascraper for others)
  // ==========================================================================
  let title = url;
  let description: string | null = null;
  let image_url: string | null = null;

  try {
    // YouTube oEmbed (fast)
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
      log(`Fetching YouTube metadata via oEmbed...`);
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        url
      )}&format=json`;
      const oembedRes = await fetch(oembedUrl);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        title = oembed.title || title;
        image_url = oembed.thumbnail_url || null;
        description = oembed.author_name ? `By ${oembed.author_name}` : null;
        log(`YouTube metadata fetched: "${title}"`);
      } else {
        log(`YouTube oEmbed failed: ${oembedRes.status}`);
      }
    }
    // Vimeo oEmbed (fast)
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
    // Metascraper for other URLs
    else {
      log(`Fetching metadata via metascraper...`);
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
      log(`Metadata scraped: "${title}"`);
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    log(`⚠️  Metadata scraping failed: ${errorMsg}`);
    console.error("Failed to scrape metadata:", e);
    // Continue with URL as title - still save the item
  }

  // Quick type detection from URL
  const type = detectTypeFromUrl(url);
  log(`Detected type: ${type}`);

  // Determine if we need background processing
  // Only articles benefit from content extraction and AI processing
  // Videos, images, and social posts don't need it
  const isArticle = isLikelyArticle(url);
  const hasFirecrawlKey = !!process.env.FIRECRAWL_API_KEY;
  const needsProcessing = isArticle && hasFirecrawlKey;

  if (!needsProcessing) {
    if (!isArticle) {
      log(`Skipping processing: URL is not an article (type: ${type})`);
    } else if (!hasFirecrawlKey) {
      log(`Skipping processing: FIRECRAWL_API_KEY not configured`);
    }
  } else {
    log(`Background processing will be triggered`);
  }

  // ==========================================================================
  // INSERT IMMEDIATELY - Don't wait for AI/content extraction
  // ==========================================================================
  const { data: item, error: insertError } = await supabase
    .from("items")
    .insert({
      url,
      title,
      description,
      image_url,
      type,
      is_kept: false, // New items go to Inbox
      is_favorite: false,
      is_archived: false,
      user_id: userId,
      processing_status: needsProcessing ? "pending" : null,
    })
    .select()
    .single();

  if (insertError) {
    log(`❌ Failed to create item: ${insertError.message}`);
    console.error("Error creating item:", insertError);
    return jsonResponse(
      { success: false, error: "Failed to create bookmark" },
      500
    );
  }

  const shortId = item.id.slice(0, 8);
  log(`✅ Item created: ${shortId} (${item.title})`);

  // ==========================================================================
  // BACKGROUND PROCESSING (using after() to keep function alive)
  // ==========================================================================
  if (needsProcessing && item) {
    log(`🚀 Triggering background processing for ${shortId}`);
    // Use after() to run processing after response is sent
    // This keeps the serverless function alive until processing completes
    after(async () => {
      try {
        await processItemInBackground(item.id, url, userId, {
          updateMetadata: true,
        });
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        log(
          `❌ Unhandled error in background processing for ${shortId}: ${errorMsg}`
        );
        console.error(`[Background] Unhandled error for ${item.id}:`, e);
      }
    });
  }

  return jsonResponse({ success: true, item }, 201);
}

/**
 * OPTIONS /api/items - Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
