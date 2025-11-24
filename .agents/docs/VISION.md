# 🌐 **Internet Shelf — Vision**

_A mixed-media Inbox → Queue → Library app that renders the Internet as beautiful, tangible digital objects._

---

# 1. **Overview**

Internet Shelf is a single place to save, consume, and curate the entire internet — videos, articles, threads, recipes, products, locations, and more — rendered as a **tangible-feeling library of object-like cards**.

It is built around one universal flow:

**Capture → Inbox → Queue → Library → Archive**

And powered by AI that:

- classifies content (Types)
- understands meaning (Topics)
- reduces clutter (auto-archive)
- personalizes consumption flow (Queue)
- enhances content (summaries, transcripts, grouping)

The long-term ambition:
**A mixed-media “Internet Player” that feels like Netflix + Raindrop + TikTok + a physical bookshelf.**

---

# 2. **Product Philosophy**

From the original document, clarified and condensed:

### **2.1 Core Principles**

1. **Capture effortlessly**
   Saving should always take <1 second and never require decisions.

2. **Consume joyfully**
   The Queue should feel like a mixed-media feed you _want_ to scroll — not a guilt pile.

3. **Organize lightly**
   Avoid folders, manual tagging, or decision fatigue.

4. **Let AI do the heavy lifting**
   Types and Topics organize everything invisibly.

5. **Internet becomes objects**
   Each content Type is visually unique (short video, article, recipe, location, product, thread, etc.).

6. **Projects are temporary, not storage**
   A pinboard layer for trips, research, design inspiration.

7. **Keep the Library intentional and small**
   Permanent collection = things you return to.

8. **Avoid clutter**
   Archive automatically ensures nothing disappears but nothing clutters.

---

# 3. **Mental Model**

(Simplified and reinforced from original)

```
          Save → Inbox → Queue → Library → Archive
                             ╲
                              ╲→ Projects (temporary pinboards)
```

### **Inbox**

The chaotic landing zone.

### **Queue**

A mixed-media feed for consumption (“consume next”).

### **Library**

Your intentional and curated collection.

### **Archive**

Your memory — out of sight, still searchable.

### **Projects**

Temporary workspaces (trips, research, inspiration boards).

---

# 4. Core Concepts

## 4.1 Types — “What kind of thing is this?”

Defined and enforced by AI/detection.
Shapes how items look and behave.
Examples from original PRD: videos, short videos, threads, recipes, locations, products, articles, documents, tools.

## 4.2 Topics — “What is this about?”

AI-generated semantic clusters such as:

- Hybrid Training
- Bali Trip
- AI / LLM Research
- Sleep Optimization
- Personal Finance

Topics create structure _without manual effort_.

## 4.3 Projects

A temporary pinboard linking (not moving) items from Inbox/Queue/Library.

Examples:

- “Bali July 2025”
- “RBAC UI Exploration”
- “Apartment inspiration”

---

# 5. **Why Internet Shelf Is New**

Derived and clarified from original differentiation section.

### Not a bookmarking tool

Because:

- Bookmarking tools require organization (tags, folders)

### Not another read-it-later

Because:

- Shelf supports **videos + threads + recipes + products + locations** all together

### Not a readwise/matter clone

Because:

- Shelf is not text-first
- It’s **object-first**
- It embraces mixed media

### Not a personal knowledge system

Because:

- It requires no maintenance
- No docs, no nodes, no workflows

### It’s a new mental model

Save → mixed-media consumption → permanent collection.

---

# 6. **Key Screens, Simplified**

## Inbox (v1)

Minimal grid or list of saved items.
Filters by Type/Topic.
Primary actions: Move to Queue / Library / Project / Archive.

## Queue (v1)

Your mixed-media “Tonight Feed”:

- YouTube videos (landscape)
- TikTok/Shorts (vertical)
- Articles (clean card)
- Threads (stack preview)
- Recipes (image + metadata)

## Library (v1)

A beautiful object gallery.
Filters: Types, Topics, Time, Source.

## Projects (v1)

Simple pinboard of items.
No custom UI needed in v1; look like Library with a “Pinned” ribbon.

---

# 7. **Full Vision: Multimodal Rendering Engine**

(Phase 2 onward)

The long-term design is preserved from original PRD:
Each Type gets a **custom rendering mode**, not just a generic embed.

### Examples:

- Clean article reader
- Full thread reconstruction
- Recipe mode with ingredients + steps
- Location mode with map preview
- Vertical short-video player
- Product card mode (price tracking, images)

This vision remains intact — just not in v0.1.

---

# 8. **Full Vision: Behavioral AI**

(Phase 3 onward)

Internet Shelf watches how you save and consume in order to:

- reorder the Queue
- cluster Topics
- auto-create micro-feeds
- auto-archive stale content
- surface weekly highlights

This remains a core part of the long-term roadmap, but excluded from MVP.

---

# 9. **MVP Strategy — “Vision-Preserved, Feasible v0.1”**

Below is the **clean, realistic MVP** that keeps the identity of your product while avoiding heavy engineering traps.

---

# **9.1 MVP v0.1 — “Lovable Core”**

### **Primary Goal**

A version that _you_ (and early users) use every day:

- to capture
- to browse
- to queue
- to curate

Without needing full parsing or full custom renderers.

### **9.1.1 Included**

#### **Capture**

- Browser extension (Save → Inbox)
- Mobile PWA share target
- Metadata-first extraction (OG tags + screenshot fallback)

#### **Types (v0.1)**

Deterministic + LLM fallback:

- Video
- Short video
- Article
- Thread
- Product-basic (optional)
- Unknown (fallback)

#### **Topics (v0.1)**

- 1 LLM call per save
- Generate 2–3 topic strings
- No clustering yet
- Deduplicate visually

#### **Inbox**

- List or grid
- Basic filtering
- Simple movement actions

#### **Queue**

- Mixed-media list
- Embeds where available
- Manual reordering
- Sort modes: Newest / Duration

#### **Library**

- Masonry layout
- Card designs per Type
- Filters: Type / Topic / Source

#### **Projects**

- Create project
- Pin items
- View project
- No extra metadata

#### **Archive**

- Manual or auto-archive consumed items

#### **Rendering (v0.1)**

- YouTube embed
- TikTok embed
- Article → in-app iframe
- Thread → First tweet preview + link
- Product → OG preview

---

### **9.1.2 Excluded from v0.1**

Explicitly removed from MVP (but kept in Vision):

- Custom article reader
- Full thread reconstruction
- Recipe mode
- Location/map rendering
- Product rich cards
- Transcripts
- Behavioral ranking
- Weekly digest
- Offline mode
- Cross-device sync UI
- Advanced projects UI
- Annotations / highlights
- Social / collaboration
- Agent-based enrichment

---

# **9.2 MVP v0.2 — “Stretch Goals”**

(Only after v0.1 works and feels good)

1. **Reader Mode**

   - Clean article view powered by Mercury API or custom parser

2. **Thread Mode**

   - Thread reconstruction (Twitter API + HTML capture)

3. **More Types**

   - Recipes
   - Products
   - Locations

4. **Better Topics**

   - Semantic clustering (embeddings)
   - Merge topics automatically

5. **Basic Behavioral Ranking**

   - Consumption-weighted Queue ordering

6. **Offline-first Queue**

   - Download articles + metadata

---

# **9.3 Full Vision Roadmap**

### **Phase 1: Capture + Cards + Core Flow**

MVP v0.1

### **Phase 2: Rendering Engine Expansion**

Article reader
Recipe renderer
Thread renderer
Location cards
Product viewer
Transcripts

### **Phase 3: Behavioral Intelligence**

Personalized Queue
Stale content cleanup
Weekly highlights
Topic evolution

### **Phase 4: Multi-device + Collaboration**

iOS app
iPad app
Mac app
Shared Projects

### **Phase 5: The Intelligent Personal Internet**

Agents
Automatic playlist generation
Personal model fine-tuning
Context-aware consumption coach

---

# 10. **Tech Stack (Recommended)**

### **Frontend**

- Next.js App Router
- Tailwind / Radix / shadcn
- Framer Motion
- Masonry layout via CSS columns or library

### **Backend**

- Supabase (Auth + DB + Storage)
- Edge functions for scraping

### **Metadata**

- Microlink API or custom metascraper
- Screenshot API if image missing

### **AI**

- OpenAI GPT-4o-mini / 5o-mini
- Only used for Topic extraction in MVP

### **Browser Extension**

- Simple POST → /api/save

---

# 11. Success Metrics (v0.1 → v0.2)

1. % of saved items consumed
2. Weekly active Queue users
3. Library size (low = success)
4. Time spent in Queue
5. % of items pinned to Projects
6. % of items saved via mobile

---

# 12. Risks (Clarified)

- Metadata scraping failures → screenshot fallback
- LLM cost (Topics) → 5o-mini
- Queue overload → allow manual reorder
- Browser extension friction → keep ultra-minimal
- PWA limitations on iOS → ensure fallback UX
