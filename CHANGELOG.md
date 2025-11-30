# Changelog

All notable changes to the Portable webapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Article Reader View** - Clean, Instapaper-style reading experience for saved articles
- **Background Processing** - Bookmarks save instantly, AI processing happens in background
  - Processing indicator shown in list and gallery views
  - Real-time updates via Supabase Realtime when processing completes
- **Content Extraction** - Automatic article content extraction using Jina Reader API
  - Supports JavaScript-rendered pages (Medium, Substack, newsletters)
  - Extracts full article content, author, publish date
  - Calculates reading time and word count
- **AI Processing** - OpenAI GPT-4o-mini integration for intelligent content analysis
  - Automatic content type detection (article, video, product, website, etc.)
  - AI-generated summaries (2-3 sentences)
  - Auto-tagging with relevant topics
- **Item Detail Page** (`/items/[id]`) with:
  - Full article reader with clean typography
  - Collapsible metadata sidebar
  - AI summary and topics display
  - Source information and actions
- **Enhanced Item Cards**
  - Type-specific icons and colors (video, article, product, etc.)
  - Reading time badge for articles
  - Video play button overlay
  - AI summary in card description
- GET `/api/items` endpoint to check if a bookmark exists before saving
- `/api/extension/version` endpoint for extension version checking
- New item types: `product` and `website`

### Changed
- Improved duplicate bookmark handling in POST `/api/items` endpoint
- Refined timeline grouping in items view: Today, Yesterday, This week, This month, This year, and year labels
- Articles with content now link to reader view instead of external URL
- List view shows reading time for articles

### Fixed
- Fixed layout shift in sign-in form when clicking submit button

## [0.0.1] - 2025-11-30

### Added
- Link capture system with API endpoint (`/api/items`) and Bearer token authentication
- API key management UI in user menu (view, copy, regenerate)
- YouTube/Vimeo oEmbed support for proper metadata extraction
- Real-time sync via Supabase Realtime
- PWA manifest with share_target for mobile
- Serwist service worker for offline support

### Fixed
- Fixed Next.js redirect error flash in auth form
- Fixed localhost IPv6 issues (use 127.0.0.1)
- Fixed server action sync issues in production

