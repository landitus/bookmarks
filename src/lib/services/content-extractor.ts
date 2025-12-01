/**
 * Content Extraction Service
 *
 * Uses Firecrawl API to extract clean, readable content from any URL.
 * Handles JavaScript-rendered pages (Medium, Substack, etc.) and returns clean markdown.
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
      author?: string | string[]; // Can be array from some sources
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
 * Clean extracted content by removing header boilerplate
 * Finds the first real content paragraph and starts from there
 */
function cleanContent(content: string): string {
  const lines = content.split("\n");
  let startIndex = 0;

  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Skip image-link lines (logos, avatars): [![text](url)](link)
    if (line.startsWith("[![")) continue;

    // Skip standalone images: ![alt](url)
    if (line.startsWith("![") && !line.includes(" ")) continue;

    // Skip navigation/metadata
    if (/^(Subscribe|Sign in|Share|SubscribeSign)$/i.test(line)) continue;
    if (/^(Subscribe|Sign in)/i.test(line) && line.length < 30) continue;

    // Skip title headings (# Title) - we already have title from metadata
    if (line.startsWith("# ") && i < 10) continue;

    // Skip subtitle headings right after title (### For something...)
    if (line.startsWith("### ") && i < 15 && line.length < 60) continue;

    // Found real content: a paragraph > 100 chars or a section heading
    if (line.length > 100) {
      startIndex = i;
      break;
    }

    // Section headings (### Sleep, ## Food) are real content
    if ((line.startsWith("## ") || line.startsWith("### ")) && i > 10) {
      startIndex = i;
      break;
    }
  }

  const cleaned = lines.slice(startIndex).join("\n").trim();

  // Remove excessive newlines
  return cleaned.replace(/\n{4,}/g, "\n\n\n");
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Extract content from a URL using Firecrawl API
 *
 * Firecrawl returns clean markdown without boilerplate, navigation, ads, etc.
 * Much cleaner than other extractors.
 *
 * @param url - The URL to extract content from
 * @returns Extracted content with metadata, or null if extraction fails
 */
export async function extractContent(
  url: string
): Promise<ExtractedContent | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    console.error("[Firecrawl] No API key configured (FIRECRAWL_API_KEY)");
    return null;
  }

  console.log(`[Firecrawl] Starting extraction for: ${url}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(FIRECRAWL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true, // Strip navigation, headers, footers - just article content
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[Firecrawl] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Firecrawl] API error: ${response.status} - ${errorText}`);
      return null;
    }

    const result: FirecrawlResponse = await response.json();

    if (!result.success || !result.data?.markdown) {
      console.error("[Firecrawl] Extraction failed:", result.error);
      return null;
    }

    const { data } = result;
    const rawContent = data.markdown!.trim();
    const content = cleanContent(rawContent);

    console.log(
      `[Firecrawl] Got content, raw: ${rawContent.length}, cleaned: ${content.length}`
    );

    const wordCount = countWords(content);
    const readingTime = calculateReadingTime(wordCount);

    // Parse publish date if available
    let publishDate: Date | null = null;
    if (data.metadata?.publishedTime) {
      const parsed = new Date(data.metadata.publishedTime);
      if (!isNaN(parsed.getTime())) {
        publishDate = parsed;
      }
    }

    // Handle author - can be string or array from Firecrawl
    let author: string | null = null;
    if (data.metadata?.author) {
      if (Array.isArray(data.metadata.author)) {
        // Take first non-"Substack" author if available
        author =
          data.metadata.author.find(
            (a: string) => a.toLowerCase() !== "substack"
          ) ||
          data.metadata.author[0] ||
          null;
      } else {
        author = data.metadata.author;
      }
    }

    return {
      title: data.metadata?.title || url,
      description: data.metadata?.description || null,
      content,
      author,
      publishDate,
      wordCount,
      readingTime,
      imageUrl: null, // Rely on og:image from metascraper instead
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[Firecrawl] Request timed out after 30s");
    } else {
      console.error("[Firecrawl] Failed to extract content:", error);
    }
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
