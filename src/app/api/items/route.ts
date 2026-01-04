import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Metascraper setup
import metascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";

// Content extraction and AI services
import {
  extractContent,
  isLikelyArticle,
} from "@/lib/services/content-extractor";
import {
  detectContentType,
  generateSummary,
  extractTopics,
  mapToItemType,
} from "@/lib/services/ai-processor";

const scraper = metascraper([
  metascraperDescription(),
  metascraperImage(),
  metascraperTitle(),
  metascraperUrl(),
]);

type ItemType =
  | "video"
  | "article"
  | "thread"
  | "image"
  | "product"
  | "website";

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
 * Quick URL-based type detection (no network calls)
 */
function detectTypeFromUrl(url: string): ItemType {
  if (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  ) {
    return "video";
  }
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) {
    return "image";
  }
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return "thread";
  }
  return "article";
}

// Processing timeout in milliseconds (45 seconds)
const PROCESSING_TIMEOUT = 45000;

/**
 * Background processing for content extraction and AI
 * Called after the response is sent to the client
 * Wrapped with timeout guard to prevent stuck jobs
 */
async function processItemInBackground(
  itemId: string,
  url: string,
  userId: string
) {
  const supabase = createServiceClient();

  // Helper for timestamped logging
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    const shortId = itemId.slice(0, 8);
    console.log(`[${timestamp}] [Background] [Item:${shortId}] ${message}`);
  };

  log(`Starting processing`);
  log(`URL: ${url}`);

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error("Processing timeout after 45 seconds")),
      PROCESSING_TIMEOUT
    );
  });

  try {
    // Race between actual processing and timeout
    await Promise.race([
      doProcessing(itemId, url, userId, supabase, log),
      timeoutPromise,
    ]);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    log(`❌ Processing failed: ${errorMsg}`);
    console.error(`[Background] Processing error details:`, e);

    // Mark as failed with error message
    await supabase
      .from("items")
      .update({
        processing_status: "failed",
        processing_error: errorMsg,
      })
      .eq("id", itemId);
  }
}

/**
 * Core processing logic - extracted for timeout wrapper
 */
async function doProcessing(
  itemId: string,
  url: string,
  userId: string,
  supabase: ReturnType<typeof createServiceClient>,
  log: (msg: string) => void
) {
  // Update status to processing
  await supabase
    .from("items")
    .update({ processing_status: "processing" })
    .eq("id", itemId);

  let content: string | null = null;
  let wordCount: number | null = null;
  let readingTime: number | null = null;
  let author: string | null = null;
  let publishDate: string | null = null;
  const originalType: ItemType = detectTypeFromUrl(url); // Keep original for failure detection
  let type: ItemType = originalType;
  let aiContentType: string | null = null;
  let aiSummary: string | null = null;
  let title: string | null = null;
  let description: string | null = null;

  // ==========================================================================
  // STEP 1: Content extraction with Jina Reader (for articles)
  // ==========================================================================
  if (isLikelyArticle(url)) {
    log(`URL is likely article, starting extraction...`);
    try {
      const extracted = await extractContent(url);
      log(
        `Extraction result: ${
          extracted ? `${extracted.content.length} chars` : "null"
        }`
      );

      if (extracted) {
        content = extracted.content;
        wordCount = extracted.wordCount;
        readingTime = extracted.readingTime;
        author = extracted.author;
        publishDate = extracted.publishDate?.toISOString() || null;

        // Use extracted metadata if available (but NOT image - keep og:image from initial save)
        if (extracted.title) title = extracted.title;
        if (extracted.description) description = extracted.description;
        // Don't overwrite image_url - the og:image from metascraper is more reliable

        log(
          `Content extracted: ${
            content?.length || 0
          } chars, ${wordCount} words, ${readingTime} min read`
        );
      } else {
        log(`No content extracted`);
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      log(`Content extraction failed: ${errorMsg}`);
      console.error(`[Background] Content extraction error details:`, e);
    }
  } else {
    log(`URL is NOT likely article, skipping extraction`);
  }

  // ==========================================================================
  // STEP 2: AI Processing (type detection, summary, topics)
  // ==========================================================================
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const topics: string[] = [];

  if (hasOpenAIKey) {
    log(`AI processing started`);
    try {
      // Get current item data for AI processing
      const { data: currentItem } = await supabase
        .from("items")
        .select("title, description")
        .eq("id", itemId)
        .single();

      const itemTitle = title || currentItem?.title || url;
      const itemDescription = description || currentItem?.description;

      // Detect content type with AI
      const typeResult = await detectContentType(
        url,
        itemTitle,
        itemDescription,
        content
      );
      aiContentType = typeResult.contentType;
      type = mapToItemType(typeResult.contentType, url);
      log(`Content type detected: ${aiContentType} → ${type}`);

      // Generate summary and extract topics (only for content with substance)
      if (content && content.length > 200) {
        const [summary, extractedTopics] = await Promise.all([
          generateSummary(itemTitle, content),
          extractTopics(itemTitle, content),
        ]);
        aiSummary = summary;
        topics.push(...extractedTopics);
        log(`AI summary generated, ${topics.length} topics extracted`);
      } else {
        log(`Skipping summary/topics (insufficient content)`);
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      log(`AI processing failed: ${errorMsg}`);
      console.error(`[Background] AI processing error details:`, e);
    }
  } else {
    log(`Skipping AI processing (no OPENAI_API_KEY)`);
  }

  // ==========================================================================
  // STEP 3: Update item with processed data
  // ==========================================================================
  // Determine final processing status
  // For articles: if no content was extracted, mark as "failed" (likely paywall)
  // Use originalType (from URL detection) NOT the AI-reassigned type
  // This ensures a Medium article that fails extraction is marked "failed"
  // even if AI later classifies it as "website" based on limited metadata
  const wasIntendedAsArticle = originalType === "article";
  const hasContent = content && content.length > 100;
  const processingStatus =
    wasIntendedAsArticle && !hasContent ? "failed" : "completed";

  const updateData: Record<string, unknown> = {
    processing_status: processingStatus,
    type,
  };

  // Only update fields that have values
  if (content) updateData.content = content;
  if (wordCount) updateData.word_count = wordCount;
  if (readingTime) updateData.reading_time = readingTime;
  if (author) updateData.author = author;
  if (publishDate) updateData.publish_date = publishDate;
  if (aiContentType) updateData.ai_content_type = aiContentType;
  if (aiSummary) updateData.ai_summary = aiSummary;
  if (title) updateData.title = title;
  if (description) updateData.description = description;

  await supabase.from("items").update(updateData).eq("id", itemId);
  log(`Database updated with status: ${processingStatus}`);

  // ==========================================================================
  // STEP 4: Create topics (if any were extracted)
  // ==========================================================================
  if (topics.length > 0) {
    log(`Creating ${topics.length} topics...`);
    try {
      for (const topicName of topics) {
        const slug = topicName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        const { data: topic } = await supabase
          .from("topics")
          .upsert(
            { user_id: userId, name: topicName, slug },
            { onConflict: "user_id,slug", ignoreDuplicates: false }
          )
          .select("id")
          .single();

        if (topic) {
          await supabase
            .from("item_topics")
            .insert({ item_id: itemId, topic_id: topic.id })
            .select();
        }
      }
      log(`Topics created successfully`);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      log(`Failed to create topics: ${errorMsg}`);
      console.error(`[Background] Topic creation error details:`, e);
    }
  }

  log(`✅ Processing completed successfully`);
}

/**
 * GET /api/items?url=<encoded_url> - Check if a bookmark exists
 */
export async function GET(request: NextRequest) {
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
  // BACKGROUND PROCESSING (fire-and-forget)
  // ==========================================================================
  if (needsProcessing && item) {
    log(`🚀 Triggering background processing for ${shortId}`);
    // Don't await - let processing happen in background
    processItemInBackground(item.id, url, userId).catch((e) => {
      const errorMsg = e instanceof Error ? e.message : String(e);
      log(
        `❌ Unhandled error in background processing for ${shortId}: ${errorMsg}`
      );
      console.error(`[Background] Unhandled error for ${item.id}:`, e);
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
