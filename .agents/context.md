# Project Context (Quick Reference)

**Last Updated:** November 29, 2025

## What We're Building

**Portable** is a mixed-media bookmarking and consumption app. "A little pocket for the internet things you love." It replaces browser tabs and "watch later" lists with a single flow: **Capture → Consume → Keep**.

## Core Problem

People save too many things (hoarding) and consume almost none of them. Current tools bury content in folders. Internet Shelf focuses on a visual "queue" and "library" to encourage consumption and curation.

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend:** Supabase (PostgreSQL, Auth, Storage).
- **AI:** OpenAI (GPT-4o-mini) for auto-tagging topics.
- **Scraping:** `metascraper` (running in Server Actions).

## Database Schema (Simplified)

- `profiles`: Users.
- `items`: The core bookmark object (URL, title, type, status).
- `topics`: Tags/Categories (AI-generated or manual).
- `projects`: Simple collections/pinboards.

## Current Phase

**Phase 2: Capture & Inbox** (Building the core CRUD and initial UI).

## Success Criteria (v0.1 MVP)

1. Effortless capture (paste URL -> pretty card).
2. Fun consumption queue.
3. Visual library (masonry grid).
