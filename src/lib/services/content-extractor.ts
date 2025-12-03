/**
 * Content Extraction Service
 *
 * Uses Firecrawl to fetch markdown content (preserves headings better than Readability
 * which can strip them if they're outside the detected article container).
 *
 * Applies light cleanup to remove common boilerplate (intros, CTAs, etc.)
 *
 * @see https://firecrawl.dev
 */

// =============================================================================
// TYPES
// =============================================================================

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
      ogImage?: string;
      publishedTime?: string;
      author?: string | string[];
    };
  };
  error?: string;
}

export interface ExtractedContent {
  title: string;
  description: string | null;
  content: string; // Markdown
  author: string | null;
  publishDate: Date | null;
  wordCount: number;
  readingTime: number; // in minutes
  imageUrl: string | null;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v2/scrape";
const WORDS_PER_MINUTE = 200;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate word count from markdown
 */
function countWords(text: string): number {
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, "") // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
    .replace(/[#*_~>\-|]/g, "") // Remove markdown chars
    .replace(/\s+/g, " ")
    .trim();

  return cleanText.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/**
 * Parse author from Firecrawl metadata (can be string or array)
 */
function parseAuthor(author: string | string[] | undefined): string | null {
  if (!author) return null;

  if (Array.isArray(author)) {
    // Filter out generic platform names, take first real author
    const realAuthor = author.find(
      (a) => !["substack", "medium"].includes(a.toLowerCase())
    );
    return realAuthor || author[0] || null;
  }

  return author;
}

/**
 * Clean markdown content by finding the real article start
 *
 * Strategy: Find the first substantial paragraph (>150 chars) after any short intro/metadata
 * This handles newsletters that start with "Hey there, I'm X..." or subscription CTAs
 */
function cleanContent(content: string): string {
  const lines = content.split("\n");
  let startIndex = 0;
  let foundStart = false;

  // Scan first 50 lines for the real article start
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Skip image lines at the start
    if (line.startsWith("![") || line.startsWith("[![")) continue;

    // Skip short lines (metadata, CTAs, etc.)
    if (line.length < 80) continue;

    // Skip lines that look like newsletter intros
    if (
      line.includes("Hey there, I'm") ||
      line.includes("Each week, I tackle") ||
      line.includes("Annual subscribers get") ||
      line.includes("Subscribe now") ||
      line.includes("while supplies last")
    ) {
      continue;
    }

    // Found a substantial paragraph - this is likely the article start
    // But look for the previous heading if there is one
    for (let j = i - 1; j >= 0; j--) {
      const prevLine = lines[j].trim();
      if (prevLine.startsWith("#")) {
        startIndex = j;
        foundStart = true;
        break;
      }
      if (!prevLine) continue;
      // If we hit non-empty non-heading, start from current line
      break;
    }

    if (!foundStart) {
      startIndex = i;
      foundStart = true;
    }
    break;
  }

  // Take content from start point
  let cleaned = lines.slice(startIndex).join("\n").trim();

  // Clean up footer boilerplate
  cleaned = cleaned
    // Remove paywall text
    .replace(
      /\n+This post is for paid subscribers[\s\S]*?Subscribe\s*\n*/gi,
      "\n\n"
    )
    .replace(/\n+Already a paid subscriber\? Sign in\s*/gi, "\n\n")
    // Remove trailing metadata tables
    .replace(/\|.*\|(?:\n\|.*\|)+\s*$/g, "")
    // Remove common footer text
    .replace(/\n{2,}(?:PreviousNext|Subscribe to [^\n]+)\s*$/gi, "")
    // Normalize excessive newlines
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  return cleaned;
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Extract content from a URL using Firecrawl
 *
 * @param url - The URL to extract content from
 * @returns Extracted content with metadata, or null if extraction fails
 */
export async function extractContent(
  url: string
): Promise<ExtractedContent | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    console.error("[Extractor] No FIRECRAWL_API_KEY configured");
    return null;
  }

  console.log(`[Extractor] Starting extraction for: ${url}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(FIRECRAWL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true, // Let Firecrawl do initial cleanup
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Extractor] Firecrawl error: ${response.status} - ${errorText}`
      );
      return null;
    }

    const result: FirecrawlResponse = await response.json();

    if (!result.success || !result.data?.markdown) {
      console.error("[Extractor] Firecrawl failed:", result.error);
      return null;
    }

    console.log(
      `[Extractor] Got markdown, length: ${result.data.markdown.length}`
    );

    // Apply our cleanup
    const content = cleanContent(result.data.markdown);

    console.log(`[Extractor] After cleanup, length: ${content.length}`);

    const wordCount = countWords(content);
    const readingTime = calculateReadingTime(wordCount);

    // Parse publish date from metadata
    let publishDate: Date | null = null;
    if (result.data.metadata?.publishedTime) {
      const parsed = new Date(result.data.metadata.publishedTime);
      if (!isNaN(parsed.getTime())) {
        publishDate = parsed;
      }
    }

    return {
      title: result.data.metadata?.title || url,
      description: result.data.metadata?.description || null,
      content,
      author: parseAuthor(result.data.metadata?.author),
      publishDate,
      wordCount,
      readingTime,
      imageUrl: null, // Rely on og:image from metascraper
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[Extractor] Request timed out after 30s");
    } else {
      console.error("[Extractor] Failed:", error);
    }
    return null;
  }
}

/**
 * Check if a URL is likely to be an article (vs video, product page, etc.)
 */
export function isLikelyArticle(url: string): boolean {
  const urlLower = url.toLowerCase();

  // Video platforms
  if (
    urlLower.includes("youtube.com") ||
    urlLower.includes("youtu.be") ||
    urlLower.includes("vimeo.com") ||
    urlLower.includes("twitch.tv") ||
    urlLower.includes("tiktok.com")
  ) {
    return false;
  }

  // Social media
  if (
    urlLower.includes("twitter.com/") ||
    urlLower.includes("x.com/") ||
    urlLower.includes("instagram.com") ||
    urlLower.includes("facebook.com")
  ) {
    return false;
  }

  // Image files
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)) {
    return false;
  }

  return true;
}
