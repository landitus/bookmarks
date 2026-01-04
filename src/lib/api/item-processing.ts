/**
 * Item processing utilities
 * Content extraction, AI processing, and database updates for items
 */

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
import { createServiceClient, ServiceClient } from "./helpers";

// =============================================================================
// TYPES
// =============================================================================

export type ItemType =
  | "video"
  | "article"
  | "thread"
  | "image"
  | "product"
  | "website";

export interface ProcessingOptions {
  /** Whether to update title/description from extracted content */
  updateMetadata?: boolean;
}

export interface ProcessingResult {
  content: string | null;
  wordCount: number | null;
  readingTime: number | null;
  author: string | null;
  publishDate: string | null;
  type: ItemType;
  aiContentType: string | null;
  aiSummary: string | null;
  title: string | null;
  description: string | null;
  topics: string[];
  processingStatus: "completed" | "failed";
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Processing timeout in milliseconds (45 seconds)
export const PROCESSING_TIMEOUT = 45000;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Quick URL-based type detection (no network calls)
 */
export function detectTypeFromUrl(url: string): ItemType {
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

// =============================================================================
// CORE PROCESSING
// =============================================================================

/**
 * Core processing logic for content extraction and AI
 * Shared between initial processing and reprocessing
 */
export async function processItemContent(
  itemId: string,
  url: string,
  userId: string,
  supabase: ServiceClient,
  log: (msg: string) => void,
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const { updateMetadata = true } = options;

  let content: string | null = null;
  let wordCount: number | null = null;
  let readingTime: number | null = null;
  let author: string | null = null;
  let publishDate: string | null = null;
  const originalType: ItemType = detectTypeFromUrl(url);
  let type: ItemType = originalType;
  let aiContentType: string | null = null;
  let aiSummary: string | null = null;
  let title: string | null = null;
  let description: string | null = null;
  const topics: string[] = [];

  // ==========================================================================
  // STEP 1: Content extraction (for articles)
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

        // Only update metadata if enabled (not during reprocess)
        if (updateMetadata) {
          if (extracted.title) title = extracted.title;
          if (extracted.description) description = extracted.description;
        }

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
      console.error(`[Processing] Content extraction error details:`, e);
    }
  } else {
    log(`URL is NOT likely article, skipping extraction`);
  }

  // ==========================================================================
  // STEP 2: AI Processing (type detection, summary, topics)
  // ==========================================================================
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

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
      console.error(`[Processing] AI processing error details:`, e);
    }
  } else {
    log(`Skipping AI processing (no OPENAI_API_KEY)`);
  }

  // Determine final processing status
  const wasIntendedAsArticle = originalType === "article";
  const hasContent = content && content.length > 100;
  const processingStatus =
    wasIntendedAsArticle && !hasContent ? "failed" : "completed";

  return {
    content,
    wordCount,
    readingTime,
    author,
    publishDate,
    type,
    aiContentType,
    aiSummary,
    title,
    description,
    topics,
    processingStatus,
  };
}

/**
 * Save processing results to database
 */
export async function saveProcessingResults(
  itemId: string,
  userId: string,
  result: ProcessingResult,
  supabase: ServiceClient,
  log: (msg: string) => void,
  options: { clearTopics?: boolean } = {}
): Promise<void> {
  const { clearTopics = false } = options;

  // Build update data
  const updateData: Record<string, unknown> = {
    processing_status: result.processingStatus,
    type: result.type,
  };

  // Only update fields that have values
  if (result.content) updateData.content = result.content;
  if (result.wordCount) updateData.word_count = result.wordCount;
  if (result.readingTime) updateData.reading_time = result.readingTime;
  if (result.author) updateData.author = result.author;
  if (result.publishDate) updateData.publish_date = result.publishDate;
  if (result.aiContentType) updateData.ai_content_type = result.aiContentType;
  if (result.aiSummary) updateData.ai_summary = result.aiSummary;
  if (result.title) updateData.title = result.title;
  if (result.description) updateData.description = result.description;

  await supabase.from("items").update(updateData).eq("id", itemId);
  log(`Database updated with status: ${result.processingStatus}`);

  // Handle topics
  if (result.topics.length > 0) {
    log(`Creating ${result.topics.length} topics...`);
    try {
      // Clear old topics if reprocessing
      if (clearTopics) {
        await supabase.from("item_topics").delete().eq("item_id", itemId);
      }

      for (const topicName of result.topics) {
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
      console.error(`[Processing] Topic creation error details:`, e);
    }
  }
}

/**
 * Full background processing with timeout guard
 */
export async function processItemInBackground(
  itemId: string,
  url: string,
  userId: string,
  options: ProcessingOptions = {}
): Promise<void> {
  const supabase = createServiceClient();

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
    // Update status to processing
    await supabase
      .from("items")
      .update({ processing_status: "processing" })
      .eq("id", itemId);

    // Race between actual processing and timeout
    const result = await Promise.race([
      processItemContent(itemId, url, userId, supabase, log, options),
      timeoutPromise,
    ]);

    // Save results
    await saveProcessingResults(itemId, userId, result, supabase, log, {
      clearTopics: !options.updateMetadata, // Clear topics during reprocess
    });

    log(`✅ Processing completed successfully`);
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
