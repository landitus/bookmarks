/**
 * AI Processing Service
 *
 * Uses OpenAI GPT-4o-mini for:
 * - Content type detection (article, video, product, website)
 * - Auto-tagging with relevant topics
 * - Summary generation
 */

import OpenAI from "openai";

// =============================================================================
// TYPES
// =============================================================================

export type AIContentType =
  | "longform-article"
  | "news-article"
  | "tutorial"
  | "blog-post"
  | "documentation"
  | "product-page"
  | "landing-page"
  | "video"
  | "social-post"
  | "forum-thread"
  | "other";

export interface AIProcessingResult {
  contentType: AIContentType;
  summary: string;
  topics: string[];
}

export interface ContentTypeResult {
  contentType: AIContentType;
  confidence: number;
  reasoning: string;
}

// =============================================================================
// OPENAI CLIENT
// =============================================================================

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
}

// =============================================================================
// CONTENT TYPE DETECTION
// =============================================================================

/**
 * Detect the content type of a URL/content using AI
 */
export async function detectContentType(
  url: string,
  title: string,
  description: string | null,
  content: string | null
): Promise<ContentTypeResult> {
  const openai = getOpenAIClient();

  // Truncate content to avoid token limits (first 2000 chars)
  const truncatedContent = content ? content.slice(0, 2000) : "";

  const prompt = `Analyze this web page and classify its content type.

URL: ${url}
Title: ${title}
Description: ${description || "N/A"}
Content preview: ${truncatedContent || "N/A"}

Classify as one of these types:
- longform-article: In-depth articles, essays, long reads (1500+ words)
- news-article: News stories, current events
- tutorial: How-to guides, step-by-step instructions
- blog-post: Personal blogs, opinion pieces, shorter articles
- documentation: Technical docs, API references, manuals
- product-page: E-commerce product listings, SaaS landing pages with pricing
- landing-page: Marketing pages, company homepages without articles
- video: Video content pages (YouTube, Vimeo, etc.)
- social-post: Social media posts, tweets, threads
- forum-thread: Forum discussions, Q&A sites
- other: Doesn't fit other categories

Respond in JSON format:
{
  "contentType": "<type>",
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation>"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      contentType: result.contentType || "other",
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning || "",
    };
  } catch (error) {
    console.error("AI content type detection failed:", error);
    return {
      contentType: "other",
      confidence: 0,
      reasoning: "Detection failed",
    };
  }
}

// =============================================================================
// SUMMARY GENERATION
// =============================================================================

/**
 * Generate a concise summary of the content
 */
export async function generateSummary(
  title: string,
  content: string
): Promise<string | null> {
  const openai = getOpenAIClient();

  // Truncate content to avoid token limits (first 4000 chars)
  const truncatedContent = content.slice(0, 4000);

  const prompt = `Summarize this article in 2-3 sentences. Be concise and capture the main point.

Title: ${title}

Content:
${truncatedContent}

Summary:`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 150,
    });

    return response.choices[0].message.content?.trim() || null;
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return null;
  }
}

// =============================================================================
// TOPIC EXTRACTION
// =============================================================================

/**
 * Extract relevant topics/tags from the content
 */
export async function extractTopics(
  title: string,
  content: string
): Promise<string[]> {
  const openai = getOpenAIClient();

  // Truncate content to avoid token limits (first 3000 chars)
  const truncatedContent = content.slice(0, 3000);

  const prompt = `Extract 1-5 broad topics from this article for classification. Use generic category names that could apply to many similar articles, not specific names, brands, or details from this particular article.

Good examples: "architecture", "interior design", "technology", "cooking", "travel", "personal finance", "productivity"
Bad examples: "cloaked house", "trias architecture", "sydney renovation" (too specific to this article)

Title: ${title}

Content:
${truncatedContent}

Return as a JSON array of 1-5 lowercase topic strings. Prefer fewer, broader topics over many specific ones.

Topics:`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 100,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Handle both array and object with topics key
    if (Array.isArray(result)) {
      return result.slice(0, 5);
    }
    if (result.topics && Array.isArray(result.topics)) {
      return result.topics.slice(0, 5);
    }

    return [];
  } catch (error) {
    console.error("AI topic extraction failed:", error);
    return [];
  }
}

// =============================================================================
// FULL PROCESSING
// =============================================================================

/**
 * Run all AI processing on content
 * Returns content type, summary, and topics
 */
export async function processContent(
  url: string,
  title: string,
  description: string | null,
  content: string | null
): Promise<AIProcessingResult | null> {
  // If no content, we can still detect type from URL/title
  const hasContent = content && content.length > 100;

  try {
    // Run content type detection (always)
    const typeResult = await detectContentType(
      url,
      title,
      description,
      content
    );

    // Only generate summary and topics if we have substantial content
    let summary: string | null = null;
    let topics: string[] = [];

    if (hasContent) {
      // Run summary and topics in parallel
      const [summaryResult, topicsResult] = await Promise.all([
        generateSummary(title, content!),
        extractTopics(title, content!),
      ]);

      summary = summaryResult;
      topics = topicsResult;
    }

    return {
      contentType: typeResult.contentType,
      summary: summary || "",
      topics,
    };
  } catch (error) {
    console.error("AI processing failed:", error);
    return null;
  }
}

// =============================================================================
// ITEM TYPE MAPPING
// =============================================================================

/**
 * Map AI content type to database item_type enum
 */
export function mapToItemType(
  aiContentType: AIContentType,
  url: string
): "video" | "article" | "thread" | "image" | "product" | "website" {
  // Video detection (override AI if URL is clearly video)
  if (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("twitch.tv")
  ) {
    return "video";
  }

  // Image detection
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)) {
    return "image";
  }

  // Map AI types to item types
  switch (aiContentType) {
    case "video":
      return "video";
    case "longform-article":
    case "news-article":
    case "tutorial":
    case "blog-post":
    case "documentation":
      return "article";
    case "forum-thread":
    case "social-post":
      return "thread";
    case "product-page":
      return "product";
    case "landing-page":
    case "other":
    default:
      return "website";
  }
}
