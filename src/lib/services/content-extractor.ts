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

// Tags to exclude from extraction (navigation, ads, sidebars, etc.)
const EXCLUDE_TAGS = [
  // Standard HTML elements
  "nav",
  "footer",
  "header",
  "aside",
  // Common CSS classes/IDs
  "sidebar",
  ".sidebar",
  ".navigation",
  ".nav",
  ".menu",
  ".advertisement",
  ".ad",
  ".ads",
  ".social-share",
  ".share-buttons",
  ".related-posts",
  ".recommended",
  ".comments",
  "#comments",
  ".comment-section",
  // Design blog custom elements (Leibal, Dezeen, etc.)
  "nav-bar-v2",
  "mobile-nav-bar",
  "add-to-moods-button",
  "moods-modal",
  "image-gallery",
  "sticky-scroller",
  "display-card",
  // Design Details / Product sections
  ".design-details",
  ".design-detail",
  // Newsletter/subscription widgets
  ".newsletter",
  ".subscribe",
  ".subscription",
  "#newsletter",
];

// Common content selectors to try if main extraction fails
// Order matters - more specific selectors first
const CONTENT_SELECTORS = [
  ".post-content", // Leibal, WordPress blogs
  ".article-content", // Common pattern
  ".entry-content", // WordPress default
  ".post-body", // Blogger, Tumblr
  "article", // Semantic HTML
  "[role='main']", // ARIA role
  "main", // Semantic HTML
];

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
 * Remove non-content images from markdown
 * Filters out icons, logos, avatars, duplicates, and other UI images while keeping article images
 */
function filterImages(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  const seenUrls = new Set<string>(); // Track seen image URLs for deduplication

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this is an image line
    const isImage =
      trimmed.startsWith("![") ||
      trimmed.startsWith("[![") ||
      /^!\[[^\]]*\]\([^)]+\)$/.test(trimmed);

    if (isImage) {
      const lowerLine = trimmed.toLowerCase();

      // Extract URL from image markdown
      const urlMatch = trimmed.match(/\(([^)]+)\)/);
      const imageUrl = urlMatch ? urlMatch[1] : "";

      // Skip duplicate images
      if (imageUrl && seenUrls.has(imageUrl)) {
        continue;
      }

      // Skip UI/decoration images (icons, logos, avatars, etc.)
      if (
        lowerLine.includes("icon") ||
        lowerLine.includes("logo") ||
        lowerLine.includes("avatar") ||
        lowerLine.includes("badge") ||
        lowerLine.includes("button") ||
        lowerLine.includes("emoji") ||
        lowerLine.includes("spinner") ||
        lowerLine.includes("loading") ||
        lowerLine.includes("arrow") ||
        lowerLine.includes("chevron") ||
        lowerLine.includes("thumbnail") ||
        lowerLine.includes("placeholder") ||
        lowerLine.includes("spacer") ||
        lowerLine.includes("pixel") ||
        lowerLine.includes("tracking") ||
        lowerLine.includes("analytics") ||
        /\b\d{1,2}x\d{1,2}\b/.test(lowerLine) || // Skip tiny images like 16x16, 32x32
        /\/ads?\/|\/banner[s]?\/|\/promo[s]?\/|doubleclick|googlesyndication/i.test(
          imageUrl
        ) // Skip ad images
      ) {
        continue;
      }

      // Track this URL as seen
      if (imageUrl) {
        seenUrls.add(imageUrl);
      }

      result.push(line);
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
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

  // Filter out excessive images
  cleaned = filterImages(cleaned);

  // Remove Leibal-style header metadata at the start
  // Pattern: "Title\n\nby Author\n\nPhotographer\n\nName" followed by images
  cleaned = cleaned
    .replace(
      /^([^\n]{1,50})\n+by\s+[^\n]+\n+(?:Photographer|Author|Category|Date)\n+[^\n]+\n+/i,
      ""
    )
    // Remove standalone "by Author" lines at start
    .replace(/^by\s+[A-Z][^\n]{0,50}\n+/i, "")
    // Remove standalone "Photographer" / "Author" labels
    .replace(/^\s*(?:Photographer|Author)\s*\n+/gi, "")
    // Fix malformed image URLs with internal spaces (e.g., "uploads/20 /image.jpg" -> "uploads/20/image.jpg")
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (match, alt, url) => {
      // If URL has spaces, try to fix them
      if (url.includes(" ")) {
        // Remove spaces that break the URL structure
        const fixedUrl = url.replace(/\s+/g, "");
        return `![${alt}](${fixedUrl})`;
      }
      return match;
    });

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
    // Remove social sharing buttons patterns
    .replace(/\n+(?:Share|Tweet|Pin|Email|Copy link)(?:\s*\n)+/gi, "\n\n")
    // Remove "Read more" / "Continue reading" links
    .replace(/\n+(?:Read more|Continue reading|See also)[^\n]*\n*/gi, "\n\n")
    // Remove design blog boilerplate (Leibal, Dezeen, etc.)
    .replace(/\n*Add to MOODS\s*\n*/gi, "\n")
    .replace(/\n*Save Image to MOODS\s*\n*/gi, "\n")
    .replace(/\n*ENQUIRE\s*\n*/gi, "\n")
    .replace(/\n*Visit Website\s*\n*/gi, "\n")
    // Remove image gallery counters (01 / 21, etc.)
    .replace(/\n*\d{1,2}\s*\/\s*\d{1,2}\s*\n*/g, "\n")
    // Remove "As seen in image" references
    .replace(/\n*As seen in image[^\n]*\n*/gi, "\n")
    // Remove MOODS modal UI text
    .replace(
      /\n*(?:Saved!|Choose A Board|Save Into:|Create New Board:)\s*\n*/gi,
      "\n"
    )
    .replace(/\n*▼\s*\n*/g, "\n")
    // Remove standalone brand/product category names that appear as noise
    .replace(/\n+(?:Furniture|Lighting|Objects?|Travel)\s*\n+/g, "\n")
    // Remove standalone social media links
    .replace(
      /\n+(?:Pinterest|Instagram|Facebook|Tumblr|LinkedIn|TikTok|Twitter|YouTube)\s*\n+/gi,
      "\n"
    )
    // Remove footer navigation items
    .replace(
      /\n+(?:Contact Us?|Submit|FAQ|Privacy|Terms?\s*&?\s*Conditions?|Trade Program|About)\s*\n+/gi,
      "\n"
    )
    // Remove "Store" / "Stories" navigation
    .replace(/\n+(?:Store|Stories|Home|Account|Cart)\s*\n+/gi, "\n")
    // Remove "Open Menu" / "Close" button text
    .replace(/\n*(?:Open Menu|Close)\s*\n*/gi, "\n")
    // Remove "Related Posts" sections and everything after
    .replace(/\n+Related Posts[\s\S]*$/gi, "")
    // Remove "Design Details" repeated sections
    .replace(/\n+Design Details[\s\S]*?(?=\n{2}[A-Z]|\n*$)/gi, "\n\n")
    // Remove submission/newsletter CTAs
    .replace(
      /\n+If you would like to feature[\s\S]*?submissions page[^\n]*\n*/gi,
      "\n\n"
    )
    .replace(/\n+Please visit our Submissions[\s\S]*?\n*/gi, "\n\n")
    // Remove product listings (price patterns)
    .replace(/\n+\$[\d,]+ USD\s*\n*/gi, "\n")
    // Remove date/category metadata lines that appear multiple times
    .replace(
      /\n+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s*\n+(?:Architecture|Interiors|Furniture|Design)\s*\n*/gi,
      "\n"
    )
    // Remove "Previous Post" / "Next Post" sections
    .replace(/\n+(?:Previous|Next)\s+Post[\s\S]*?(?=\n{2}[A-Z]|\n*$)/gi, "\n\n")
    // Normalize excessive newlines
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  return cleaned;
}

/**
 * Check if extracted content is actually useful
 * Returns false if content has almost no text
 */
function isContentUseful(content: string): boolean {
  const wordCount = countWords(content);

  // Need at least 50 words to be considered useful content
  if (wordCount < 50) {
    return false;
  }

  return true;
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Call Firecrawl API with given options
 */
async function callFirecrawl(
  url: string,
  apiKey: string,
  options: {
    includeTags?: string[];
    excludeTags?: string[];
  } = {}
): Promise<FirecrawlResponse | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(FIRECRAWL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        excludeTags: options.excludeTags || EXCLUDE_TAGS,
        includeTags: options.includeTags,
        removeBase64Images: true,
        blockAds: true,
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

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

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
    // First attempt: standard extraction with excludeTags
    let result = await callFirecrawl(url, apiKey);
    let content = "";
    let wordCount = 0;

    if (result?.success && result.data?.markdown) {
      content = cleanContent(result.data.markdown);
      wordCount = countWords(content);
      console.log(
        `[Extractor] First attempt: ${wordCount} words, ${content.length} chars`
      );
    }

    // If first attempt didn't get good content, try with specific content selectors
    if (wordCount < 100) {
      console.log(
        `[Extractor] First attempt got only ${wordCount} words, trying content selectors...`
      );

      for (const selector of CONTENT_SELECTORS) {
        console.log(`[Extractor] Trying selector: ${selector}`);
        const selectorResult = await callFirecrawl(url, apiKey, {
          includeTags: [selector],
          excludeTags: [], // Don't exclude when using includeTags
        });

        if (selectorResult?.success && selectorResult.data?.markdown) {
          const selectorContent = cleanContent(selectorResult.data.markdown);
          const selectorWordCount = countWords(selectorContent);
          console.log(
            `[Extractor] Selector ${selector}: ${selectorWordCount} words`
          );

          // Use this result if it's better
          if (selectorWordCount > wordCount) {
            result = selectorResult;
            content = selectorContent;
            wordCount = selectorWordCount;
            console.log(
              `[Extractor] Using selector ${selector} with ${wordCount} words`
            );

            // If we got good content, stop trying
            if (wordCount >= 100) {
              break;
            }
          }
        }
      }
    }

    if (!result?.success || !result.data?.markdown) {
      console.error("[Extractor] All extraction attempts failed");
      return null;
    }

    console.log(`[Extractor] Final content: ${wordCount} words`);

    const readingTime = calculateReadingTime(wordCount);

    // Check if content is actually useful (not just images/links)
    if (!isContentUseful(content)) {
      console.log(
        `[Extractor] Content not useful (${wordCount} words) - likely a gallery or directory page`
      );
      return null;
    }

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
