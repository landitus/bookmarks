# Current Focus

**Last Updated:** January 4, 2026
**Branch:** `main`
**Status:** Realtime Processing Reliability ✅

## 🎉 Recently Completed

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

| File                                      | Change                                      |
| ----------------------------------------- | ------------------------------------------- |
| `src/components/items/items-view.tsx`     | Added polling fallback for processing items |
| `src/app/api/items/route.ts`              | Added 45s timeout guard to processing       |
| `src/app/api/items/reprocess/route.ts`    | Added 45s timeout guard to reprocessing     |

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
