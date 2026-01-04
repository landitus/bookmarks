# Current Focus

**Last Updated:** January 4, 2026
**Branch:** `main`
**Status:** Content Extraction Improvements ✅

## 🎉 Recently Completed

### Advanced Code Block Extraction (Jan 4, 2026)

Fixed code block extraction for sites with complex syntax highlighting (like Stripe's blog):

- [x] **Two-pass extraction**: Extract code blocks first with placeholders, convert HTML, then inject clean code fences
- [x] **Hidden element removal**: Remove `display: none` elements that contain duplicate code content
- [x] **Syntax highlighting support**: Extract text from nested `<span class="token ...">` elements (Prism.js, HLJS, etc.)
- [x] **`waitFor` option**: Added 3-second wait for JS-rendered content before extraction
- [x] **Clean code fences**: Outputs proper triple-backtick fences without escaping issues

### Content Extraction: HTML Format + Readability Fallback (Jan 4, 2026)

Improved code block rendering and added free extraction fallback:

- [x] **Firecrawl HTML format**: Changed from `markdown` to `html` format, then convert to Markdown locally using `node-html-markdown` - preserves `<pre><code>` blocks properly
- [x] **Readability fallback extractor**: Created `readability-extractor.ts` using Mozilla's Reader View algorithm (free, local, no API key needed)
- [x] **Parser selection**: Added `CONTENT_PARSER` env var to switch between `firecrawl` (default) and `readability`
- [x] **Auto-fallback**: Falls back to Readability automatically if `FIRECRAWL_API_KEY` is not configured
- [x] **Updated env.example**: Added documentation for `CONTENT_PARSER` and extraction options

### UX Polish (Jan 4, 2026)

- [x] Title clicks now open external URL in new tab (instead of reader view for articles)
- [x] Added "Preview" button next to actions menu to open reader/preview view
- [x] Removed "Refresh content" action from list view dropdown (keep it only in reader view)
- [x] Renamed "Keep to Library" to just "Keep" for simpler UX

### API Code DRY Refactor (Jan 4, 2026)

Extracted shared utilities from items API routes:

- [x] Created `src/lib/api/helpers.ts` - generic API utilities (auth, CORS, JSON response)
- [x] Created `src/lib/api/item-processing.ts` - content extraction and AI processing logic
- [x] Route handlers now import from shared modules
- [x] `route.ts` reduced from 617 → 291 lines, `reprocess/route.ts` from 346 → 84 lines

### Serverless Background Processing Fix (Jan 4, 2026)

Fixed background processing getting killed before completion on Vercel serverless:

- [x] Use Next.js `after()` in route handlers to keep function alive until processing completes
- [x] Use `after()` in `refreshContent` server action to ensure reprocess API call completes
- [x] Added `processing_error` column to items table to capture failure messages
- [x] Reprocess trigger now uses deployed base URL (SITE_URL → APP_URL → VERCEL_URL) instead of localhost
- [x] Added 5s timeout to metadata fetch in `createItem` server action
- [x] Added 10s timeout to reprocess trigger fetch

### Realtime Processing Reliability (Jan 4, 2026)

Fixed unreliable UI updates when background processing completes:

- [x] Added polling fallback to `ItemsView` - polls every 3s when items are processing
- [x] Added server-side timeout guard (45s) to prevent stuck "processing" states
- [x] Jobs exceeding timeout are marked as `failed` with error message
- [x] Polling stops automatically when all items complete/fail
- [x] Applied timeout to both initial save and reprocess endpoints

### Content Extraction Improvements (Jan 3, 2026)

Improved Firecrawl content extraction to better detect main content and filter unnecessary images:

- [x] Added `excludeTags` to Firecrawl API request (nav, footer, header, aside, sidebars, ads, etc.)
- [x] Enabled `removeBase64Images` and `blockAds` Firecrawl options
- [x] Filter out UI images (icons, logos, avatars, badges, spinners, tiny images)
- [x] Added content quality check - rejects extractions with <50 words
- [x] Added cleanup for social sharing buttons and "Read more" links
- [x] Added "Refresh content" action in item dropdown to re-extract content
- [x] Shows loading spinner during extraction with automatic page refresh
- [x] Disabled refresh action during processing (shows "Refreshing..." with spinner)
- [x] Articles always link to reader view (even when processing)
- [x] **Smart fallback extraction**: Tries content selectors (`.post-content`, `.article-content`, etc.) when initial extraction gets <100 words
- [x] Added cleanup for design blog metadata headers (title/author/photographer)
- [x] Fixed malformed image URLs with spaces

### Inbox/Library/Archive UX Model (Jan 3, 2026)

Restructured the app around a triage-based workflow: **Capture → Consume → Keep or Discard**

- [x] Database migration: Added `is_kept`, `kept_at`, `archived_at` columns
- [x] Updated types.ts: `is_kept` replaces `is_later`
- [x] New server actions: `keepItem()`, `discardItem()`, `restoreItem()`
- [x] Created new routes: `/inbox`, `/library`, `/archive`
- [x] Deleted old routes: `/everything`, `/later`, `/favorites`
- [x] Updated navigation: Inbox/Library/Archive tabs
- [x] Context-aware ItemActions component
- [x] Reader view triage buttons (Keep/Discard in header)
- [x] Toast notifications for all actions
- [x] Smart sorting: Inbox by capture date, Library by kept_at, Archive by archived_at
- [x] Flat list view for Library/Archive (no date grouping)
- [x] Legacy route redirects in middleware
- [x] Updated seed data with 3 favorites, realistic triage states

## 🚀 Next Steps

- [ ] Apply migration to production database
- [ ] Test full flow end-to-end
- [ ] Update extension if needed

## 📁 Key Files Changed

| File                                        | Change                                                |
| ------------------------------------------- | ----------------------------------------------------- |
| `src/lib/services/content-extractor.ts`     | HTML format + parser selection + Readability fallback |
| `src/lib/services/readability-extractor.ts` | NEW: Mozilla Readability-based local extractor        |
| `env.example`                               | Added CONTENT_PARSER docs                             |
| `src/lib/api/helpers.ts`                    | Generic API utilities (auth, CORS)                    |
| `src/lib/api/item-processing.ts`            | Item processing logic (extraction, AI)                |
| `src/components/items/items-view.tsx`       | Polling fallback for processing items                 |

## 🧭 Data Model

| Bucket  | Condition                                 | Sort By       |
| ------- | ----------------------------------------- | ------------- |
| Inbox   | `is_kept = false AND is_archived = false` | `created_at`  |
| Library | `is_kept = true AND is_archived = false`  | `kept_at`     |
| Archive | `is_archived = true`                      | `archived_at` |

**Key columns:**

- `is_kept` - Whether item has been triaged to Library
- `kept_at` - Timestamp when item was moved to Library (for sorting)
- `archived_at` - Timestamp when item was archived (for sorting)

## 🔗 Related

- Plan: `.agents/docs/plans/2026-01-03-inbox-library-ux.md`
- Previous: Article Reader & AI Features (complete)
