# Current Focus

**Last Updated:** November 30, 2025
**Session:** Article Reader with AI Features

## ✅ Completed This Session

### Content Extraction & Reader View

- [x] Database migration for content extraction columns (`content`, `word_count`, `reading_time`, `author`, `publish_date`, `ai_summary`, `ai_content_type`)
- [x] New item types: `product` and `website`
- [x] Content extraction service using Jina Reader API
- [x] AI processing service with OpenAI GPT-4o-mini
  - Content type detection
  - Summary generation
  - Topic extraction
- [x] Updated API endpoint to integrate extraction and AI
- [x] Item detail page (`/items/[id]`) with reader view
- [x] Metadata sidebar with AI summary, topics, source info
- [x] Enhanced item cards with type-specific styling and reading time

### Key Features

1. **Jina Reader Integration** - Extracts clean markdown from any URL, handles JS-rendered pages
2. **AI Content Classification** - Detects article, video, product, website, tutorial, etc.
3. **Auto-Tagging** - AI extracts 3-5 relevant topics from content
4. **Summary Generation** - 2-3 sentence AI summaries
5. **Reader View** - Clean typography, serif fonts, comfortable reading
6. **Smart Linking** - Articles open in reader view, videos/products open externally

## 📁 Key Files Changed

| File | Purpose |
| ---- | ------- |
| `supabase/migrations/20251130100000_content_extraction.sql` | New columns + enum values |
| `src/lib/types.ts` | Extended Item type with new fields |
| `src/lib/services/content-extractor.ts` | Jina Reader API integration |
| `src/lib/services/ai-processor.ts` | OpenAI integration for AI features |
| `src/app/api/items/route.ts` | Integrated extraction + AI processing |
| `src/app/(protected)/items/[id]/page.tsx` | Item detail page (server component) |
| `src/app/(protected)/items/[id]/item-reader-view.tsx` | Reader view component |
| `src/components/items/item-card.tsx` | Type-specific cards with reading time |
| `src/components/items/items-view.tsx` | Smart linking to reader view |

## 🔧 Environment Variables Needed

```bash
# OpenAI API Key (for AI features)
OPENAI_API_KEY=sk-...

# Optional: Jina API Key (for higher rate limits)
# JINA_API_KEY=...
```

## 🚀 How to Test

1. **Apply migration:**
   ```bash
   supabase db reset  # or apply migration manually
   ```

2. **Add OpenAI API key** to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. **Save an article URL** via extension or API

4. **Click the article** in the list - should open reader view

## 🔄 Next Steps

1. **Test Content Extraction** - Verify Jina Reader works with various sites
2. **Test AI Features** - Check type detection, summaries, topics
3. **Video Player** - Embed YouTube/Vimeo players in detail view
4. **Reading Progress** - Track how far user has read
5. **Offline Reading** - Cache article content for offline access

## ✅ Previous Sessions

- Theme Picker with Profile Persistence
- Layout Toggle System (sidebar/topbar)
- Unified Collection Refactor (Everything/Later/Favorites)
- Link Capture System + Extension UI Polish
- Production Deployment
