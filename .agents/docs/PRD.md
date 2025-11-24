# **Internet Shelf — PRD (Lean & Realistic v0.1)**

_A mixed-media bookmarking + consumption app built for real humans._

---

# 1. **Purpose & Vision**

Internet Shelf solves a simple problem:
**People save too many things and consume almost none.**
Tabs pile up, bookmarks become graveyards, watch-later lists overflow, and saved lists across apps fragment attention.

Internet Shelf creates a single flow:

**Capture → Consume → Keep**

Rendered through an object-based, visually delightful UI (the core identity from the original PRD) — but implemented realistically for a solo dev using metadata-first rendering.

---

# 2. **Guiding Principles**

(Adapted from original core philosophy)

1. **Zero friction at save time**
   Never force decisions. Everything lands in Inbox.

2. **Mixed-media, single timeline consumption**
   Queue should feel like Netflix + YouTube + Instagram Saved.

3. **Curation, not hoarding**
   Library stays small, intentional, and beautiful.

4. **AI organizes for the user**
   Types (Videos, Articles…) + Topics (AI clusters) happen invisibly.

5. **Projects are temporary pinboards, not storage**
   No folders. No hierarchy.

6. **Shipping matters more than perfection**
   v0.1 prioritizes speed, simplicity, and delight over completeness.

---

# 3. **Mental Model (Simplified)**

We keep the 3-bucket flow because it is **your core differentiator** and essential to the feel of the app. The LLM’s suggestion to flatten everything into a single list has been rejected.

```
         Save everything →
+------------------+       +----------------+
|      INBOX       |  →    |     QUEUE      |
| (Untriaged)      |       | (Consume Next) |
+------------------+       +----------------+
           \                       ↓
            \                     keep
             \                +----------------+
              \--------------|     LIBRARY     |
                              |  (Permanent)   |
                              +----------------+
```

**Projects** remain but in a **ultra-minimal form**:

- A simple pinboard referencing existing items.
- No ownership, no moving items around.
- No special views required for v0.1.

---

# 4. **v0.1 Goals (“Lovable MVP”)**

A **beautiful, simple, stable** version of the product that focuses on:

### ✔ Capture is effortless

- Browser extension → Inbox
- Mobile share sheet → Inbox

### ✔ Items look gorgeous from day 1

- Basic but delightful cards that reflect Types (even if rendered with embeds)

### ✔ Queue is fun to scroll

- Simple list
- Mixed-media items
- Manual reordering or “Sort by: newest / duration”

### ✔ Library feels curated

- Masonry grid
- AI-driven Types & Topics available as filters
- User moves items to Library intentionally

### ✔ Projects exist but minimal

- Create project
- Pin items
- Nothing else

### ✔ Metadata-first rendering

- Use OG tags
- Use screenshot fallback
- Use embeds for YouTube/TikTok
- Article pages open in-app in an iframe (reader mode comes later)

v0.1 = **the first version you would genuinely want to use daily.**

---

# 5. **Feature Scope — What Ships in v0.1**

Below is a precise, implementable feature list for Cursor.

---

## **5.1 Capture (MVP)**

### **Desktop Browser Extension**

**Save → Inbox** with:

- url
- title
- favicon
- og:image
- og:description
- screenshot fallback (via API or your serverless function)

**No parsing. No reader mode.**

---

### **Mobile Share Sheet (PWA-friendly version)**

- Share → “Add to Internet Shelf”
- Saves the same metadata
- You handle iOS via PWA share-target API

---

## **5.2 Automatic Classification (AI Lite)**

### **Types (deterministic or small LLM)**

Heuristics first:

- If URL contains youtube.com → Video
- If TikTok/Instagram → ShortVideo
- If Medium/Substack → Article
- If tweet or thread → Thread
- Else → Article (default)

**Later replaced by LLM Type inference.**

---

### **Topics (LLM)**

Upon save:

- Run 1 LLM call: “Give me 2–3 semantic topics for this content.”
- Do not attempt clustering.
- Just store topics as strings.
- Deduplicate on display-time.

This keeps Topics lightweight and useful without building embeddings infra.

---

## **5.3 Inbox (MVP)**

- Simple list or grid
- Each item shows: thumbnail, title, source, Type
- Actions:

  - Move → Queue
  - Move → Library
  - Add to Project
  - Archive (optional)

- Filters: Type, Topic
- No ranking, no nudges

---

## **5.4 Queue (MVP)**

A consumable list.

### Display:

- Vertical scrolling feed
- Items grouped by Type visually
- Embeds where needed (YT, TikTok)

### Sorting:

- Manual reorder
- Or built-in:

  - Newest
  - Shortest first (if duration known)

### Interactions:

- Mark as consumed → moves to Archive
- Move to Library

### Later (not in v0.1):

- behavioral ranking
- nightly personalized feed
- smart grouping

---

## **5.5 Library (MVP)**

The core “Gallery” experience.

### Layout:

- Masonry grid
- Beautiful card design per Type
- Uniform spacing and elevation
- No custom readers yet

### Filters:

- Type
- Topic
- Source
- Time saved

### Actions:

- Move to Queue
- Add to Project
- Archive

---

## **5.6 Rendering (MVP: “Embeds-first”)**

To ship fast:

### **Video**

- YouTube → embed
- Vimeo → embed
- TikTok → embed

### **Article**

- In-app iframe preview OR open in new tab
- No reader view yet

### **Thread**

- Show first tweet as card
- Open X.com embed or link

This preserves your “physical object card” aesthetic but defers heavy work.

---

## **5.7 Projects (MVP)**

- Create project (title only)
- Pin items from anywhere
- View project (simple list/grid)
- Auto-sort by “recently pinned”

That’s it.
No boards, no layouts, no metadata.

---

## **5.8 Archive (MVP)**

- Items manually archived
- Optional auto-archive: “consumed items → archive”

Very simple.

---

# 6. **Technical Plan (Realistic for a Solo Dev)**

## **Frontend**

- Next.js App Router
- Tailwind + Radix + shadcn
- Framer Motion for card micro-interactions
- Masonry layout with CSS columns or react-masonry library

## **Backend**

- Supabase (DB + Auth)
- Supabase Storage for screenshots (optional)
- Edge Functions for metadata scraping

## **Metadata Scraping**

Option 1: **Microlink API** (fastest)
Option 2: Your own edge function using:

- got
- metascraper
- fallback screenshot via browserless API

MVP: **Use Microlink** to ship faster.

## **AI**

- OpenAI GPT-4o-mini / 5o-mini for Topics
- No embeddings or clustering infra yet
- 1 LLM call per save → Topics generation

## **Browser Extension**

- Simple POST to your API
- No in-extension UI needed for v0.1

---

# 7. **What We Explicitly Defer**

To avoid v0.1 complexity:

### ❌ Custom article reader

### ❌ Recipe rendering

### ❌ Location/map cards

### ❌ Product pages

### ❌ Document viewer

### ❌ Full thread reconstruction

### ❌ Behavior AI for Queue

### ❌ Weekly digest

### ❌ Multi-device sync UI

### ❌ Collaboration

### ❌ Complex Projects view

### ❌ Offline downloads

All of these exist in the _vision_ but not in v0.1.

---

# 8. **Success Criteria for v0.1**

The MVP is “lovable” if:

### **1. Capture is effortless**

- You find yourself saving everything without thinking.

### **2. Queue is fun to scroll**

- Feels like your personal mixed-media feed.

### **3. Library feels like a gallery**

- Items look good enough to browse visually.

### **4. You can plan a trip/work project**

- Simple Projects let you gather items.

### **5. You stop using Watch Later or bookmarks**

- Internet Shelf becomes your primary save place.

---

# 9. **Roadmap (Realistic Sequence)**

### **v0.1 – Lovable MVP (4–6 weeks)**

- Auth
- Save → Inbox
- Types + Topics (simple)
- Queue
- Library
- Projects minimal
- Archive
- Embeds

### **v0.2 – Core Experience**

- Reader mode
- Thread rendering
- Better card design
- Offline MQ
- More robust scraper
- Basic behavioral ranking

### **v1.0 – “Internet as Objects”**

- Full rendering engine
- Recipes, Locations, Products
- Advanced Topics clustering
- Personalized Queue
- Mobile app

---

# 10. **Risks & Mitigations (Lean)**

### **Metadata failures → fallback screenshot**

Use Microlink or Browserless.

### **AI Topic noise → reduce to 1–2 topics**

Small LLM + strict format.

### **Queue becomes messy → simple sort modes**

Manual reordering allowed.

### **Embed inconsistencies → wrap with fallback view**

Graceful errors.
