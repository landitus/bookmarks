# Project Context (Quick Reference)

**Last Updated:** January 3, 2026

## What We're Building

**Portable** is a mixed-media bookmarking and consumption app. "A little pocket for the internet things you love." It replaces browser tabs and "watch later" lists with a single flow: **Capture → Consume → Keep**.

## Core Problem

People save too many things (hoarding) and consume almost none of them. Current tools bury content in folders. Portable focuses on a visual "queue" and "library" to encourage consumption and curation.

## Tech Stack

- **Frontend:** Next.js 16+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI:** OpenAI GPT-4o-mini for content analysis and auto-tagging
- **Content Extraction:** Firecrawl API for article content extraction
- **Browser Extension:** WXT framework for cross-browser compatibility

## Database Schema (Simplified)

- `profiles`: Users with theme preferences and API keys
- `items`: Core bookmark object (URL, title, type, status, content, AI metadata)
- `topics`: Tags/Categories (AI-generated or manual)
- `projects`: Simple collections/pinboards
- Processing: Background job system with status tracking

## Current Phase

**Phase 3: AI-Enhanced Reader** (Article reader view with AI processing complete ✅)

## Recent Milestones

- ✅ Background processing with status tracking
- ✅ Content extraction via Firecrawl
- ✅ AI summaries and auto-tagging
- ✅ Clean reader view for articles
- ✅ Real-time processing updates
- ✅ Comprehensive seed data for development
