/**
 * Readability-based Content Extraction Service
 *
 * Uses Mozilla's Readability (same as Firefox Reader View) to extract
 * article content. This is a free, local alternative to Firecrawl.
 *
 * Best for:
 * - Local development without API keys
 * - Cost savings (no API calls)
 * - Sites that don't require JavaScript rendering
 *
 * Limitations:
 * - Cannot handle JavaScript-rendered content
 * - No anti-bot bypass capabilities
 *
 * @see https://github.com/mozilla/readability
 */

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { NodeHtmlMarkdown } from "node-html-markdown";

// =============================================================================
// TYPES
// =============================================================================

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

const WORDS_PER_MINUTE = 200;
const REQUEST_TIMEOUT = 15000; // 15 seconds

// Initialize HTML to Markdown converter
const nhm = new NodeHtmlMarkdown({
  codeFence: "```",
  codeBlockStyle: "fenced",
  bulletMarker: "-",
  strongDelimiter: "**",
  emDelimiter: "*",
});

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
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html: string): string {
  return nhm.translate(html);
}

/**
 * Extract Open Graph and meta description from document
 */
function extractMetadata(doc: Document): {
  description: string | null;
  ogImage: string | null;
  publishedTime: string | null;
} {
  const getMetaContent = (name: string): string | null => {
    const meta =
      doc.querySelector(`meta[property="${name}"]`) ||
      doc.querySelector(`meta[name="${name}"]`);
    return meta?.getAttribute("content") || null;
  };

  return {
    description:
      getMetaContent("og:description") || getMetaContent("description"),
    ogImage: getMetaContent("og:image"),
    publishedTime:
      getMetaContent("article:published_time") ||
      getMetaContent("datePublished"),
  };
}

/**
 * Clean markdown content (simplified version of main extractor's cleanup)
 */
function cleanContent(content: string): string {
  return (
    content
      // Remove paywall text
      .replace(
        /\n+This post is for paid subscribers[\s\S]*?Subscribe\s*\n*/gi,
        "\n\n"
      )
      // Remove social sharing buttons
      .replace(/\n+(?:Share|Tweet|Pin|Email|Copy link)(?:\s*\n)+/gi, "\n\n")
      // Remove "Read more" links
      .replace(/\n+(?:Read more|Continue reading|See also)[^\n]*\n*/gi, "\n\n")
      // Normalize excessive newlines
      .replace(/\n{4,}/g, "\n\n\n")
      .trim()
  );
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Extract content from a URL using Mozilla Readability
 *
 * @param url - The URL to extract content from
 * @returns Extracted content with metadata, or null if extraction fails
 */
export async function extractWithReadability(
  url: string
): Promise<ExtractedContent | null> {
  console.log(`[Readability] Starting extraction for: ${url}`);

  try {
    // Fetch the page HTML
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      headers: {
        // Pretend to be a browser for better compatibility
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        `[Readability] Failed to fetch: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const html = await response.text();
    console.log(`[Readability] Fetched ${html.length} bytes`);

    // Parse with JSDOM
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    // Extract metadata before Readability modifies the document
    const metadata = extractMetadata(doc);

    // Run Readability
    const reader = new Readability(doc);
    const article = reader.parse();

    if (!article || !article.content) {
      console.error("[Readability] Failed to parse article");
      return null;
    }

    console.log(
      `[Readability] Parsed article: "${article.title}" by ${article.byline}`
    );

    // Convert HTML content to Markdown
    const markdown = htmlToMarkdown(article.content);
    const cleanedContent = cleanContent(markdown);
    const wordCount = countWords(cleanedContent);

    console.log(`[Readability] Content: ${wordCount} words`);

    // Check minimum content threshold
    if (wordCount < 50) {
      console.log(
        `[Readability] Content too short (${wordCount} words) - likely not an article`
      );
      return null;
    }

    // Parse publish date
    let publishDate: Date | null = null;
    if (metadata.publishedTime) {
      const parsed = new Date(metadata.publishedTime);
      if (!isNaN(parsed.getTime())) {
        publishDate = parsed;
      }
    }

    return {
      title: article.title || url,
      description: article.excerpt || metadata.description,
      content: cleanedContent,
      author: article.byline || null,
      publishDate,
      wordCount,
      readingTime: calculateReadingTime(wordCount),
      imageUrl: metadata.ogImage,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[Readability] Request timed out");
    } else {
      console.error("[Readability] Failed:", error);
    }
    return null;
  }
}
