# Article Reader with AI Features

**Created:** November 30, 2025
**Status:** Implemented

## Overview

Implement an article-first "Read Later" experience with content extraction using Jina Reader API, a dedicated reader view page, and AI-powered features (content type detection, auto-tagging, summaries).

## Current State

- **Item types**: `video | article | thread | image` (basic URL-based detection in `src/app/api/items/route.ts`)
- **Metadata**: Title, description, image via metascraper
- **No detail page** - Cards link directly to external URL
- **No content extraction** - No reader view capability

## Implementation Plan

### 1. Schema Migration - Extended Metadata

Add new columns to `items` table for rich content:

```sql
ALTER TABLE items ADD COLUMN content text;           -- Extracted article body (markdown)
ALTER TABLE items ADD COLUMN word_count integer;     -- For reading time calc
ALTER TABLE items ADD COLUMN reading_time integer;   -- Minutes to read
ALTER TABLE items ADD COLUMN author text;            -- Article author
ALTER TABLE items ADD COLUMN publish_date timestamptz; -- Original publish date
ALTER TABLE items ADD COLUMN ai_summary text;        -- AI-generated summary
ALTER TABLE items ADD COLUMN ai_content_type text;   -- AI-detected type
```

Update `item_type` enum to include `product` and `website`:

```sql
ALTER TYPE item_type ADD VALUE 'product';
ALTER TYPE item_type ADD VALUE 'website';
```

### 2. Content Extraction Service (Jina Reader API)

Create `/src/lib/services/content-extractor.ts`:

**Why Jina Reader:**
- Handles JavaScript-rendered content (Medium, Substack, newsletters)
- Returns clean markdown (perfect for reader view)
- Free tier with reasonable rate limits
- No heavy dependencies (no Puppeteer/jsdom needed)

**Implementation:**
```typescript
// Simple API call - prepend r.jina.ai to any URL
const response = await fetch(`https://r.jina.ai/${url}`, {
  headers: { 'Accept': 'application/json' }
});
const data = await response.json();
// Returns: { title, content, url, description, ... }
```

**Features:**
- Extract article content as markdown
- Parse author and publish date from response
- Calculate word count and reading time (avg 200 wpm)
- Graceful fallback if extraction fails (store as "website" type)

### 3. AI Processing Service

Create `/src/lib/services/ai-processor.ts`:

- **Content type detection**: Classify URL/content as article, video, product, website
- **Auto-tagging**: Extract 3-5 relevant topics from content
- **Summary generation**: Create 2-3 sentence summary

Use OpenAI GPT-4o-mini. Process immediately on save for MVP (simpler than background queues).

### 4. Update API Route

Modify `src/app/api/items/route.ts`:

- After basic metadata scraping, run Jina content extraction
- Run AI content type detection
- Store all extracted data in item record
- Trigger AI tagging/summary generation

### 5. Item Detail Page

Create `/src/app/(protected)/items/[id]/page.tsx`:

**Layout:**
```
+------------------+----------+
|    Reader View   | Metadata |
|    (Article)     | Sidebar  |
|                  | -------- |
|    Clean text    | Tags     |
|    formatting    | Summary  |
|                  | Actions  |
+------------------+----------+
```

**Reader View Features:**
- Clean typography (serif font, wide line height)
- Render markdown content
- Reading time display
- Integrates with existing theme system

**Metadata Sidebar:**
- Source domain + favicon
- Author, publish date
- AI-generated summary
- AI-generated tags (clickable to filter)
- Actions: Archive, Favorite, Share, Open Original

### 6. Enhanced Item Cards

Update `src/components/items/item-card.tsx`:

- Reading time badge for articles (e.g., "5 min read")
- Play button overlay for videos
- Type-specific accent colors/icons

### 7. TypeScript Types

Update `src/lib/types.ts`:

```typescript
export type ItemType = "video" | "article" | "thread" | "image" | "product" | "website";

export interface Item {
  // ... existing fields
  content: string | null;
  word_count: number | null;
  reading_time: number | null;
  author: string | null;
  publish_date: string | null;
  ai_summary: string | null;
  ai_content_type: string | null;
}
```

## File Changes Summary

| File | Change |
|------|--------|
| `supabase/migrations/202XXXXX_content_extraction.sql` | New columns + enum values |
| `src/lib/types.ts` | Extended Item type |
| `src/lib/services/content-extractor.ts` | New - Jina Reader integration |
| `src/lib/services/ai-processor.ts` | New - OpenAI integration |
| `src/app/api/items/route.ts` | Integrate extraction + AI |
| `src/app/(protected)/items/[id]/page.tsx` | New - Detail/reader page |
| `src/components/items/item-card.tsx` | Type-specific enhancements |
| `src/components/items/items-view.tsx` | Link to detail page instead of external |

## Dependencies to Install

```bash
pnpm add openai react-markdown
```

No additional dependencies needed for Jina (just fetch).

## Todos

- [x] Create migration for content extraction columns and new item types
- [x] Build content extraction service using Jina Reader API
- [x] Build AI processing service for type detection, tagging, and summaries
- [x] Integrate extraction and AI into /api/items POST endpoint
- [x] Create item detail page with reader view and metadata sidebar
- [x] Add type-specific styling and reading time to item cards
- [x] Update TypeScript types for extended Item fields

