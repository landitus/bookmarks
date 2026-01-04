import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
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

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  const apiKey = authHeader.slice(7);

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

type ItemType =
  | "video"
  | "article"
  | "thread"
  | "image"
  | "product"
  | "website";

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

/**
 * POST /api/items/reprocess - Reprocess an item's content extraction
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);

  if ("error" in auth) {
    return jsonResponse({ success: false, error: auth.error }, auth.status);
  }

  const { userId } = auth;

  let body: { itemId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }

  const { itemId } = body;

  if (!itemId) {
    return jsonResponse({ success: false, error: "itemId is required" }, 400);
  }

  const supabase = createServiceClient();

  // Get the item
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !item) {
    return jsonResponse({ success: false, error: "Item not found" }, 404);
  }

  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    const shortId = itemId.slice(0, 8);
    console.log(`[${timestamp}] [Reprocess] [Item:${shortId}] ${message}`);
  };

  log(`Starting reprocess for: ${item.url}`);

  // Update status to processing
  await supabase
    .from("items")
    .update({ processing_status: "processing" })
    .eq("id", itemId);

  // Process in background (fire-and-forget)
  processItem(itemId, item.url, userId, log).catch((e) => {
    log(`❌ Processing failed: ${e}`);
  });

  return jsonResponse({ success: true, message: "Reprocessing started" });
}

async function processItem(
  itemId: string,
  url: string,
  userId: string,
  log: (msg: string) => void
) {
  const supabase = createServiceClient();

  try {
    let content: string | null = null;
    let wordCount: number | null = null;
    let readingTime: number | null = null;
    let author: string | null = null;
    let publishDate: string | null = null;
    const originalType: ItemType = detectTypeFromUrl(url);
    let type: ItemType = originalType;
    let aiContentType: string | null = null;
    let aiSummary: string | null = null;

    // Content extraction
    if (isLikelyArticle(url)) {
      log(`Extracting content...`);
      try {
        const extracted = await extractContent(url);
        if (extracted) {
          content = extracted.content;
          wordCount = extracted.wordCount;
          readingTime = extracted.readingTime;
          author = extracted.author;
          publishDate = extracted.publishDate?.toISOString() || null;
          // Note: We intentionally don't update title/description during reprocess
          // to preserve user's original saved title
          log(`Content extracted: ${content?.length || 0} chars`);
        } else {
          log(`No content extracted`);
        }
      } catch (e) {
        log(`Content extraction failed: ${e}`);
      }
    }

    // AI Processing
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const topics: string[] = [];

    if (hasOpenAIKey) {
      log(`AI processing...`);
      try {
        // Get current item's title/description for AI processing
        const { data: currentItem } = await supabase
          .from("items")
          .select("title, description")
          .eq("id", itemId)
          .single();

        const itemTitle = currentItem?.title || url;
        const itemDescription = currentItem?.description;

        const typeResult = await detectContentType(
          url,
          itemTitle,
          itemDescription,
          content
        );
        aiContentType = typeResult.contentType;
        type = mapToItemType(typeResult.contentType, url);
        log(`Content type: ${aiContentType} → ${type}`);

        if (content && content.length > 200) {
          const [summary, extractedTopics] = await Promise.all([
            generateSummary(itemTitle, content),
            extractTopics(itemTitle, content),
          ]);
          aiSummary = summary;
          topics.push(...extractedTopics);
          log(`AI summary generated, ${topics.length} topics`);
        }
      } catch (e) {
        log(`AI processing failed: ${e}`);
      }
    }

    // Determine final status
    const wasIntendedAsArticle = originalType === "article";
    const hasContent = content && content.length > 100;
    const processingStatus =
      wasIntendedAsArticle && !hasContent ? "failed" : "completed";

    // Update item
    const updateData: Record<string, unknown> = {
      processing_status: processingStatus,
      type,
    };

    if (content) updateData.content = content;
    if (wordCount) updateData.word_count = wordCount;
    if (readingTime) updateData.reading_time = readingTime;
    if (author) updateData.author = author;
    if (publishDate) updateData.publish_date = publishDate;
    if (aiContentType) updateData.ai_content_type = aiContentType;
    if (aiSummary) updateData.ai_summary = aiSummary;
    // Note: title and description are intentionally NOT updated during reprocess
    // to preserve the user's original saved title

    await supabase.from("items").update(updateData).eq("id", itemId);
    log(`✅ Reprocess completed with status: ${processingStatus}`);

    // Clear old topics and create new ones
    if (topics.length > 0) {
      // First, remove all existing topic associations for this item
      await supabase.from("item_topics").delete().eq("item_id", itemId);

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
    }
  } catch (e) {
    log(`❌ Error: ${e}`);
    await supabase
      .from("items")
      .update({ processing_status: "failed" })
      .eq("id", itemId);
  }
}

/**
 * OPTIONS - Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
