# Changelog

All notable changes to the Portable webapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Inbox/Library/Archive UX Model** - Complete redesign of app navigation around a triage-based workflow
  - New **Inbox** view for uncategorized/incoming items (replaces Everything)
  - New **Library** view for kept/saved items with favorites filter
  - New **Archive** view for discarded items with restore capability
  - Context-aware actions: Keep/Discard for Inbox, Favorite/Archive for Library, Restore/Delete for Archive
  - Toast notifications for all triage actions
  - Legacy route redirects for backwards compatibility (/everything → /inbox)
- **Reader Triage Actions** - Prominent Keep/Discard buttons in reader view header
  - Actions adapt based on item state (inbox/library/archive)
- **Refresh Content Action** - New dropdown action to re-extract content for any item
  - Triggers fresh content extraction with latest improvements
  - Available in item dropdown menu as "Refresh content"
  - Shows loading spinner in reader view during extraction
  - Automatically refreshes content when extraction completes
  - Polls for completion status with 30-second timeout
- **Improved Topic Extraction** - AI extracts 1-5 broad, generic topics for better classification
  - Topics are now generic categories (e.g., "business", "economics") rather than specific article terms
  - Previous topics are cleared when reprocessing content
  - Better for organizing and discovering similar content

### Changed

- **Improved Content Extraction** - Better main content detection and image filtering
  - Added `excludeTags` to Firecrawl API (nav, footer, header, aside, sidebars, ads, comments, etc.)
  - Enabled `removeBase64Images` and `blockAds` options for cleaner extraction
  - Filter out UI images (icons, logos, avatars, badges, spinners, tiny images)
  - Added content quality check: rejects extractions with <50 words
  - Added cleanup for social sharing buttons and "Read more" links
  - **Smart fallback extraction**: If initial extraction gets <100 words, tries content selectors (`.post-content`, `.article-content`, `.entry-content`, `article`, `main`, etc.)
  - Added cleanup for design blog metadata (title/author/photographer headers)
  - Fixed malformed image URLs with spaces breaking markdown rendering
  - Duplicate image detection (prevents same image appearing multiple times)
  - Enhanced image filtering: ad networks, tracking pixels, placeholders, thumbnails
  - Custom image rendering with lazy loading and error handling (broken images auto-hide)
- **Copy Link Action** - Added "Copy link" option as first item in bookmark actions dropdown menu
- **Enhanced Logging** - Improved server-side logging for debugging AI processing and API requests
  - Timestamped logs for all background processing steps
  - Detailed API endpoint logging showing item creation, type detection, and processing decisions
  - Clear indicators when processing is skipped (e.g., for videos)

### Changed

- **Navigation Restructure** - Replaced Everything/Later/Favorites with Inbox/Library/Archive tabs
- **Data Model** - Added `is_kept`, `kept_at`, `archived_at` columns for triage state, deprecated `is_later`
- **Smart Sorting** - Inbox sorts by capture date, Library by "kept at" date, Archive by "archived at" date
- **Library List View** - Flat list (not grouped by date) since items are sorted by when they were kept
- **Item Actions** - Now context-aware based on which bucket the item is in
- **Production Database** - Applied content extraction and processing status migrations to production Supabase instance

### Added

- **Article Reader View** - Clean, Instapaper-style reading experience for saved articles
  - Dedicated reader route (`/items/[id]`) with unified header design
  - Typography-optimized prose styling with proper heading scales
  - Collapsible metadata sidebar with AI summary and topics
- **Background Processing** - Bookmarks save instantly, AI processing happens in background
  - Processing indicator shown in list and gallery views
  - Real-time updates via Supabase Realtime when processing completes
- **Content Extraction** - Automatic article content extraction using Firecrawl API
  - Supports JavaScript-rendered pages (Medium, Substack, newsletters)
  - Extracts full article content, author, publish date
  - Calculates reading time and word count
  - Smart content cleaning to remove header boilerplate
- **AI Processing** - OpenAI GPT-4o-mini integration for intelligent content analysis
  - Automatic content type detection (article, video, product, website, etc.)
  - AI-generated summaries (2-3 sentences)
  - Auto-tagging with relevant topics
- **Shared App Header** - Unified header component across all views
  - Consistent branding and user menu
  - Customizable center content per page
- **Comprehensive Seed Data** - Rich development dataset for local testing
  - Test user account (test@portable.dev / password123)
  - 24 sample items across all types (articles, videos, products, threads, images, websites)
  - 10 sample topics with realistic categorization
  - 3 sample projects/collections with item associations
  - Items distributed across time periods (today, yesterday, last week, last month)
  - Various states: favorites, later, archived, and processing statuses
- GET `/api/items` endpoint to check if a bookmark exists before saving
- `/api/extension/version` endpoint for extension version checking
- New item types: `product` and `website`

### Changed

- Improved duplicate bookmark handling in POST `/api/items` endpoint
- Refined timeline grouping in items view: Today, Yesterday, This week, This month, This year, and year labels
- Articles with content now link to reader view instead of external URL
- List view shows reading time for articles
- Switched from Jina Reader to Firecrawl for better content extraction quality
- Improved content cleaning to preserve article headings while removing boilerplate

### Fixed

- Fixed layout shift in sign-in form when clicking submit button
- Fixed incorrect processing status when AI reclassifies article type (articles that fail extraction now correctly marked as "failed")
- **Security**: Updated Next.js from 16.0.4 to 16.1.1 to address CVE-2025-66478 (critical RCE vulnerability)

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
