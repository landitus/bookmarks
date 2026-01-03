# Current Focus

**Last Updated:** January 3, 2026
**Branch:** `main`
**Status:** Article Reader & AI Features - Complete & Merged ✅

## 🎉 Recently Completed (Merged to Main)

### Content Extraction & Reader View (Nov 30, 2025)

- [x] Database migrations for content extraction and processing status
- [x] New item types: `product` and `website`
- [x] Content extraction service using Firecrawl API (switched from Jina Reader)
- [x] AI processing service with OpenAI GPT-4o-mini
  - Content type detection
  - Summary generation (2-3 sentences)
  - Topic extraction and auto-tagging
- [x] Background processing system (items save instantly, AI runs async)
- [x] Updated API endpoint with background job queuing
- [x] Item detail page (`/items/[id]`) with reader view
- [x] Shared app header component across all views
- [x] Metadata sidebar with AI summary, topics, source info
- [x] Enhanced item cards with type-specific styling and reading time
- [x] Processing status indicators in list and gallery views
- [x] Real-time updates when processing completes

### Development & Deployment (Jan 3, 2026)

- [x] Comprehensive seed data for local development (24 items, 10 topics, 3 projects)
- [x] Branch merged to main (`feature/article-reader-ai` → `main`)
- [x] Security update: Next.js 16.0.4 → 16.1.1 (CVE-2025-66478)
- [x] **Production database updated** - Applied content extraction and processing status migrations

### Key Features

1. **Firecrawl Integration** - Extracts clean markdown from any URL, handles JS-rendered pages (Medium, Substack, etc.)
2. **Background Processing** - Items save instantly, AI processing happens asynchronously with status tracking
3. **AI Content Classification** - Detects article, video, product, website, tutorial, and more
4. **Auto-Tagging** - AI extracts 3-5 relevant topics from content
5. **Summary Generation** - 2-3 sentence AI summaries for quick context
6. **Reader View** - Clean typography, prose styling, comfortable reading experience
7. **Smart Linking** - Articles with content open in reader view, videos/products open externally
8. **Real-time Updates** - Processing status updates live via Supabase Realtime

## 📁 Key Files

| File                                                        | Purpose                                                   |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| `supabase/migrations/20251130100000_content_extraction.sql` | Content extraction columns + enum values                  |
| `supabase/migrations/20251130110000_processing_status.sql`  | Processing status tracking                                |
| `supabase/seed.sql`                                         | Comprehensive test data (24 items, 10 topics, 3 projects) |
| `src/lib/types.ts`                                          | Extended Item type with new fields                        |
| `src/lib/services/content-extractor.ts`                     | Firecrawl API integration                                 |
| `src/lib/services/ai-processor.ts`                          | OpenAI integration for AI features                        |
| `src/app/api/items/route.ts`                                | Background processing queue                               |
| `src/app/(reader)/items/[id]/page.tsx`                      | Item detail page (server component)                       |
| `src/app/(reader)/items/[id]/item-reader-view.tsx`          | Reader view component                                     |
| `src/app/(reader)/layout.tsx`                               | Shared reader layout                                      |
| `src/components/layout/app-header.tsx`                      | Unified header component                                  |
| `src/components/items/item-card.tsx`                        | Type-specific cards with processing status                |
| `src/components/items/items-view.tsx`                       | Real-time updates + smart linking                         |

## 🔧 Environment Variables

```bash
# OpenAI API Key (for AI features)
OPENAI_API_KEY=sk-...

# Firecrawl API Key (for content extraction)
FIRECRAWL_API_KEY=fc-...
```

## 🚀 Testing Guide

### Quick Start with Seed Data

1. **Reset database with seed data:**

   ```bash
   supabase db reset
   ```

   This creates:

   - Test user: `test@portable.dev` / `password123`
   - 24 sample items (articles, videos, products, threads, images, websites)
   - 10 sample topics
   - 3 sample projects

2. **Add API keys** to `.env.local`:

   ```bash
   OPENAI_API_KEY=sk-...
   FIRECRAWL_API_KEY=fc-...
   ```

3. **Test reader view:**
   - Login with test account
   - Click any article in the list
   - Should open clean reader view with AI summary and topics

### Testing New Items

1. **Save a new article URL** via extension or API
2. **Watch processing status** - card shows "Processing..." indicator
3. **Real-time update** - status updates automatically when complete
4. **Open reader view** - click article to see extracted content

## 🔄 What's Next

### Potential Enhancements

1. **Error Handling** - Better UX for failed extractions
2. **Video Player** - Embed YouTube/Vimeo players in detail view
3. **Reading Progress** - Track how far user has read
4. **Offline Reading** - Cache article content for offline access
5. **Manual Editing** - Allow users to edit extracted content
6. **Content Search** - Full-text search across article content

## ✅ Previous Features

- Theme Picker with Profile Persistence
- Layout Toggle System (sidebar/topbar)
- Unified Collection Refactor (Everything/Later/Favorites)
- Link Capture System + Extension UI Polish
- Production Deployment
- Real-time Sync via Supabase Realtime
- PWA with Share Target
