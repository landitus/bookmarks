/**
 * Content Extraction Service
 *
 * Uses Jina Reader API to extract clean, readable content from any URL.
 * Handles JavaScript-rendered pages (Medium, Substack, etc.) and returns markdown.
 *
 * @see https://jina.ai/reader/
 */

// =============================================================================
// TYPES
// =============================================================================

export interface JinaReaderResponse {
  code: number;
  status: number;
  data: {
    title: string;
    description: string;
    url: string;
    content: string; // Markdown content
    publishedTime?: string;
    usage: {
      tokens: number;
    };
  };
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

const JINA_READER_BASE_URL = "https://r.jina.ai";
const WORDS_PER_MINUTE = 200; // Average reading speed

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate word count from text content
 */
function countWords(text: string): number {
  // Remove markdown syntax for more accurate count
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, "") // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with text
    .replace(/[#*_~>\-|]/g, "") // Remove markdown symbols
    .replace(/\s+/g, " ") // Normalize whitespace
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
 * Try to extract author from content
 * Looks for common patterns like "By Author Name" at the start
 */
function extractAuthor(content: string): string | null {
  // Look for "By [Name]" pattern at the beginning
  const byMatch = content.match(/^(?:By|Written by|Author:?)\s+([A-Z][a-zA-Z\s.'-]+)/im);
  if (byMatch) {
    return byMatch[1].trim();
  }
  return null;
}

/**
 * Extract first image URL from markdown content
 */
function extractFirstImage(content: string): string | null {
  const imageMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return imageMatch ? imageMatch[1] : null;
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Extract content from a URL using Jina Reader API
 *
 * @param url - The URL to extract content from
 * @returns Extracted content with metadata, or null if extraction fails
 */
export async function extractContent(url: string): Promise<ExtractedContent | null> {
  try {
    // Call Jina Reader API
    const response = await fetch(`${JINA_READER_BASE_URL}/${url}`, {
      headers: {
        Accept: "application/json",
        // Optional: Add API key for higher rate limits
        // 'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`Jina Reader API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const result: JinaReaderResponse = await response.json();

    if (!result.data || !result.data.content) {
      console.error("Jina Reader returned empty content");
      return null;
    }

    const { data } = result;
    const wordCount = countWords(data.content);
    const readingTime = calculateReadingTime(wordCount);
    const author = extractAuthor(data.content);
    const imageUrl = extractFirstImage(data.content);

    // Parse publish date if available
    let publishDate: Date | null = null;
    if (data.publishedTime) {
      const parsed = new Date(data.publishedTime);
      if (!isNaN(parsed.getTime())) {
        publishDate = parsed;
      }
    }

    return {
      title: data.title || url,
      description: data.description || null,
      content: data.content,
      author,
      publishDate,
      wordCount,
      readingTime,
      imageUrl,
    };
  } catch (error) {
    console.error("Failed to extract content:", error);
    return null;
  }
}

/**
 * Check if a URL is likely to be an article (vs video, product page, etc.)
 * This is a heuristic check before running full extraction
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

  // Social media (often not extractable as articles)
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

  // Default: assume it could be an article
  return true;
}

