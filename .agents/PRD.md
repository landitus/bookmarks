# PRD: Internet Shelf — A Unified App for Capturing, Organizing, and Consuming the Internet

## 1. Overview

*(Diagrams and mocks are conceptual placeholders — these illustrate how the system should look and feel visually. Replace with actual images during UI phase.)*

### **Diagram: High-level mental model**
```
            +----------------+
            |     INBOX      |
            |  (Everything)  |
            +--------+-------+
                     |
                     v
            +----------------+
            |     QUEUE      |
            | (Consume Next) |
            +--------+-------+
                     |
                     v
            +----------------+
            |    LIBRARY     |
            | (Keep Forever) |
            +----------------+
                     \
                      \
                       v
            +----------------+
            |   PROJECTS     |
            | (Temporary)    |
            +----------------+
```

Internet Shelf is a lightweight, AI‑powered app that turns the sprawling content of the internet—videos, articles, threads, recipes, products, locations, and more—into a beautifully rendered, tangible-feeling library. It is designed around three core buckets (Inbox → Queue → Library) and uses automatic classification (Types + Topics) plus temporary Projects to support real-life consumption and research without demanding heavy organization.

The app’s mission: **Capture effortlessly. Organize automatically. Consume delightfully. Collect intentionally.**

---

## 2. Core Product Philosophy
- Reduce friction at every step.
- Never force decisions at the moment of saving.
- Avoid cognitive overload and second‑brain complexity.
- Treat the internet like a collection of physical artifacts.
- Support mixed-media consumption in a single place.
- Keep permanent storage (Library) small, curated, and useful.
- Let AI structure content invisibly.
- Support temporary research spaces (Projects) without turning them into folders.

---

## 3. User Mental Model
The mental model of Internet Shelf is intentionally simple, intuitive, and low‑maintenance. It mirrors how people naturally interact with the internet today: we **capture chaotically**, **consume selectively**, **keep only what matters**, and **let the rest fade away**. The system is built to support this flow without adding friction or demanding manual organization.

---

### **3.1 The Four Core Surfaces**
Internet Shelf is anchored in four clearly defined surfaces, each with a single purpose:

#### **1. Inbox — “Everything comes here first.”**
The universal landing zone for all saved content. Users never need to decide where something goes during capture.
- Captures from browser, mobile share sheet, AI recommendations, or feeds
- Holds *all types* of content: videos, articles, threads, products, recipes, locations, documents, etc.
- Light triage optional: move to Queue, Library, Project, or Archive
- No pressure to maintain Inbox Zero

#### **2. Queue — “What I want to consume next.”**
A mixed‑media playlist designed for how people actually consume content today.
- Feels like a cross between Netflix, TikTok, YouTube Watch Later, and a reading list
- Perfect for evening browsing, gym warm‑ups, commute time, or bathroom reading
- Sorted automatically by AI based on interests, behavior, and relevance
- Includes videos, threads, articles, podcasts, recipes, etc.

#### **3. Library — “This stays with me.”**
A curated, evergreen collection of content worth keeping.
- Items appear as beautifully rendered, physical-feeling digital objects
- Browsable via **Types** (Articles, Videos, Threads, Recipes…) and **Topics** (Fitness, AI, Travel…)
- Remains intentionally small — users must consciously add things here
- The long-term memory of the system

#### **4. Archive — “Stored but out of the way.”**
A passive layer where old, consumed, or irrelevant content goes.
- Nothing is lost; everything remains searchable
- Auto-archives stale Inbox items and consumed Queue items
- Keeps Library and Inbox light without requiring deletion
- Critical for preventing system clutter

---

### **3.2 Invisible Structure: Types & Topics**
To avoid folders, tags, and manual categorization, Internet Shelf uses two invisible layers that organize content automatically:

#### **Types — “What kind of thing is this?”**
Fixed, universal categories applied by AI:
- Article
- Video / Short Video
- Podcast
- Thread
- Recipe
- Product (Digital / Physical)
- Location
- Document / Reference
- Tool / App

Types power visual identity (card shapes), rendering modes, filtering, and browsing.

#### **Topics — “What is this about?”**
Dynamic, AI‑generated semantic clusters:
- “Hybrid Training”
- “AI / LLMs”
- “Design Systems & UI Patterns”
- “Bali Trip 2025”
- “Sleep Optimization”
- “Personal Finance”
- “Admin Portal / RBAC Research”

Topics emerge from behavior, content similarity, and project activity. Users may optionally rename a Topic but never need to create or maintain them.

---

### **3.3 Projects — Temporary Workspaces (Not Storage)**
Projects act like flexible pinboards for short‑term goals:
- Trip planning (e.g., “Bali July 2025”)
- Work research (e.g., “RBAC UI Exploration”)
- Inspiration boards (e.g., “Apartment Vibes”)
- Creative projects (e.g., “Writing App v0”)

Key principles:
- Projects *reference* content; they never “own” or store it
- Content stays in Inbox, Library, or Queue — avoiding duplication
- Projects auto‑archive after inactivity, keeping mental space clear

This avoids the common anti‑pattern where projects become mixed‑content, permanent storage blobs.

---

### **3.4 Why This Mental Model Works**
The model intentionally reduces cognitive load:
- Users capture without thinking
- Queue provides a joyful, frictionless consumption surface
- Library stays curated and meaningful
- Archive handles cleanup silently
- Types & Topics create structure without user effort
- Projects support real‑life workflows without turning into folders

The result: a system that feels light, intuitive, and aligned with how people actually browse, save, and consume content in the real world.

---




---

## 4. Target Users

### **Diagram: Content Flow**
```
Browser/Mobile → INBOX → (Queue / Library / Archive)
                           \
                            → PROJECTS (non-storage)
```

- Knowledge workers
- Designers, engineers, founders
- Curious power users
- Travelers and planners
- People who use YouTube, TikTok, X, IG, and newsletters heavily
- People overwhelmed with bookmarks / tabs / saved lists

Users who want:
- A single place to save everything
- A fast way to consume interesting content
- A beautiful, tangible-feeling library of objects
- A simple system that doesn’t require maintenance

---

## 5. Core Features

### **Mock: Content Card Types (visual shapes)**

**Short Video** — tall 9:16 vertical tile
```
┌───────────────┐
│      ▻         │
│   (thumbnail)  │
│     0:15       │
└───────────────┘
```

**YouTube Video** — widescreen 16:9
```
┌──────────────────────────┐
│     ▻ (thumbnail)        │
│            12:34         │
└──────────────────────────┘
```

**Article** — magazine-style card
```
┌──────────────────────────┐
│ [A] Title                │
│ Subtitle / Source        │
└──────────────────────────┘
```

**Recipe** — cookbook card
```
┌──────────────────────────┐
│   (food image)           │
│  Recipe · 45 min         │
└──────────────────────────┘
```

**Location** — postcard with map
```
┌──────────────────────────┐
│ (photo)       📍 map pin │
│ Villa Vua · Ubud         │
└──────────────────────────┘
```

**Thread** — stacked tweets
```
┌──────────────────────────┐
│ @user: first tweet...    │
│ — second...              │
│ — third...               │
└──────────────────────────┘
```

---

### **Mock: Library Masonry Layout**
```
[Recipe Card]   [Article Card]    [Short Video]
[Product]       [Short Video]     [Location]
[Thread]        [Article]         [YouTube Video]
```

---

### **Mock: Queue (Mixed-Media Stream)**
```
Queue
────────────────────────────
• Thread — “A framework for…“
• Podcast — “Economic Theory” (56 min)
• Article — “iOS Accessibility Guide”
• YT Video — “Transforms Explained” (21:07)
• Recipe — “Vegetarian Tacos” (30 min)
• Video — “Data Analytics Story”
```

### **5.1. Capture System**
- One-click save from browser extension → Inbox
- Mobile share sheet → Inbox
- Optional “Bookmark” button to skip Inbox → Library
- All content types supported: articles, videos, threads, reels, tiktoks, docs, products, maps, etc.
- Auto-screenshot for websites with fallback to metadata

### **5.2. Automatic Classification (AI)**
AI performs invisible work:
- Extract metadata
- Parse content type (Type)
- Cluster into Topics (semantic grouping)
- Detect duplicates
- Group similar items
- Auto-enrich items (transcripts, summaries)
- Assign quality scores based on content

### **5.3. Inbox**
- List or grid view
- Minimal UI
- Soft suggestions ("4 items older than 30 days — move to archive?")
- Filters by Type/Topic available but optional
- No forced organization

### **5.4. Queue (Consumption Mode)**
A mixed-media playlist where:
- YouTube videos appear as wide thumbnails
- Shorts/TikToks appear as vertical previews
- Articles show minimal clean cards
- Threads show stacked-card preview
- Podcasts show audio cards
- Recipes show recipe tiles
- Products and Locations fade lower in priority

The Queue is ordered based on:
- User saves/consumption history
- Behavioral signals
- Duration / time-of-day patterns

**Queue = nightly TV + commute feed + toilet feed + reading list.**

### **5.5. Library (Curated Storage)**
- Masonry layout with visually distinct cards per Type
- Filters along left sidebar: **Types**, **Topics**, **Time**, **Format**, **Source**
- Categories are not user-created; Topics are AI-generated but can be renamed
- Library remains small and high-value — users manually move content here

### **5.6. Content Rendering Views**
Each content type has a dedicated rendering mode:
- **Articles** → clean reader view
- **Videos** → embedded player + transcript
- **Short videos** → vertical player
- **Threads** → reconstructed long-form view
- **Recipes** → structured recipe mode
- **Products** → product card + store link
- **Locations** → map + info window
- **Documents** → stripped down “reference mode”

### **5.7. Projects (Temporary Workspaces)**
- Add items from Inbox/Library/Queue by pinning
- Ideal for: trip planning, work exploration, design inspiration, research
- Not folders — items are not moved
- Auto-archive after inactivity

---

## 6. Differentiation – The "Internet as Objects" Concept
Each content Type is rendered as a unique **physical-looking artifact**:
- Vertical TikTok/Reel cards
- Horizontal YouTube tiles
- Magazine-like article previews
- Cookbook-style recipe cards
- Postcards for locations
- Product cards (physical/digital)
- Thread stacks
- Website screenshot tiles

This creates:
- Fast scanning
- High aesthetic value
- Emotional connection
- Tangible-feeling browsing

No other app (Raindrop, Instapaper, Pocket, Matter, Are.na) delivers this level of multimodal object rendering.

---

## 7. Behavioral Learning (AI)
AI adapts to user behavior:
- What content they save most
- What they consume fully vs. abandon
- What they move to Queue vs. Library
- Time-of-day consumption habits
- Project pinning signals

AI shapes:
- Queue ranking
- Topic clusters
- Suggestions
- Auto-cleaning
- Highlights of the week

---

## 8. Antipatterns to Avoid
### **Organization anti-patterns**
- Forcing folder selection
- Manual tagging
- Complex hierarchies
- Too many buckets (Read Later, Saved Videos, Lists…)
- Projects acting as storage

### **Information overload anti-patterns**
- Showing raw URLs
- Treating all content types the same
- No auto-screenshot or metadata
- Overly dense interfaces

### **Behavior design anti-patterns**
- Guilt-driven Inbox Zero
- Users forced to maintain structure
- Friction at save-time
- Heavy onboarding

### **Queue anti-patterns**
- Letting Queue become storage
- Mixing short-form spam with long-form gems

### **Library anti-patterns**
- Letting Library grow endlessly
- Using user-created categories
- Forcing explicit organization

---

## 9. MVP Scope
### **Include:**
- Browser extension (Save → Inbox)
- Mobile Share (Save → Inbox)
- Inbox view
- Masonry Library with Type/Topic filters
- Simple Queue (linear list)
- Automatic Type classification
- Basic Topic clustering
- Basic content rendering (articles, YT videos, threads)
- Project pinning (minimal)

### **Exclude (for now):**
- Multi-device sync (v2)
- Advanced rendering (recipes, locations)
- Full transcripts
- Downloading videos
- Highlights system
- Social sharing
- Collaborative features

---

## 10. Roadmap (High-Level)
### **Phase 1: Core Flow**
- Save → Inbox
- Move to Queue / Library
- AI Types
- Basic Topics

### **Phase 2: Rendering Engine**
- Cards per Type
- Masonry grid
- Article reader
- Video player
- Threads long-form

### **Phase 3: Behavior Learning**
- Queue personalization
- Weekly digest
- Stale content cleanup

### **Phase 4: Advanced Types**
- Recipes
- Locations
- Products
- Podcasts

### **Phase 5: Multi-device ecosystem + Collaboration**
- iPad app
- Mac app
- Web app sync
- Shared Projects

---

## 11. Success Metrics
- % of content consumed from Queue
- % of Library items accessed within 30 days
- Weekly Inbox processing rate
- Reduction in saved browser tabs
- Time spent in consumption mode
- Number of Projects created and completed

---

## 12. Risks
- AI misclassification (mitigated with correction)
- Too much clutter in Inbox (mitigated with soft cleanup)
- Queue overflow (mitigated with ranking)
- Rendering complexity (solved with Type-first pipelines)

---

## 13. Future Potential
- Personal AI model fine-tuned on user's consumption
- Agent-based summarization
- "Assistant that knows your entire reading history"
- Auto-generated curated lists (“Your Fitness library”)
- Multi-user shared discovery (for couples or teams)

---

## 14. Competitive Analysis

Below is a landscape comparison of tools that partially overlap with Internet Shelf. None of them provide the unified capture→consume→curate model or multimodal object-based rendering.

### **14.1 Direct / Adjacent Competitors**

#### **Pocket**
- **Strengths:** Solid read-it-later tool, simple saving, good typography.
- **Weaknesses:** Articles only; weak YouTube/TikTok support; Queue becomes a graveyard; no Topics; no Projects.
- **Opportunity:** Become a true mixed-media consumption feed, not just a reading list.

#### **Instapaper**
- **Strengths:** Clean reading experience, highlights.
- **Weaknesses:** Article-only; outdated UI; no AI clustering; no multimedia.
- **Opportunity:** Internet Shelf covers all content types, not just text.

#### **Matter**
- **Strengths:** Premium design, podcast integration, good reading.
- **Weaknesses:** Poor short-form handling; no real Queue intelligence; Library grows messy; limited card differentiation.
- **Opportunity:** Superior rendering engine for every content type.

#### **Raindrop.io**
- **Strengths:** Bookmark organizer with folders & tags; good web clipper.
- **Weaknesses:** Heavy manual organization; not consumption-oriented; Library becomes bloated; no Queue.
- **Opportunity:** Replace folders/tags with Types + Topics + behavioral AI.

#### **Are.na**
- **Strengths:** Beautiful inspiration boards; creative audience.
- **Weaknesses:** Manual curation only; no AI; no consumption flow.
- **Opportunity:** Provide effortless automated inspiration + curation.

#### **Notion** (as a de facto bookmarking tool)
- **Strengths:** Extremely flexible; people dump bookmarks into tables.
- **Weaknesses:** Zero automation; manual maintenance; mixed content looks bad.
- **Opportunity:** Automated, gorgeous card rendering + semantic search.

---

### **14.2 Social Apps Used as Save Tools**

#### **YouTube Watch Later**
- **Strengths:** Good for videos.
- **Weaknesses:** Cannot mix with articles, threads, or short videos; becomes overwhelming.

#### **Instagram Saved**
- **Strengths:** Great for visuals.
- **Weaknesses:** No organization; no Inbox; no multi-format.

#### **TikTok Favorites**
- **Strengths:** Fast to save.
- **Weaknesses:** Impossible to organize or filter; zero cross-media value.

Internet Shelf solves this by creating *a universal place* where all content can live together.

---

### **14.3 Technical/Developer-Oriented Tools**

#### **Arc Browser (Little Arc + Spaces)**
- **Strengths:** Visual tabs; good for ephemeral content.
- **Weaknesses:** Not a long-term library; no consumption mode; no AI.

#### **Obsidian + plugins**
- **Strengths:** Custom workflows.
- **Weaknesses:** Setup-heavy; Markdown-only; no multimedia rendering.

#### **Readwise Reader (AI Edition)**
- **Strengths:** Good semantic search; AI summaries; supports mixed media.
- **Weaknesses:** Still text-first; weak visual identity; Queue becomes overloaded.

**Gap:** Internet Shelf positions itself as visually distinct, AI‑organized, and delightfully consumable.

---

### **14.4 Summary of Differentiation**
**Internet Shelf differentiators:**
- The internet rendered as *physical digital objects* (cards per content type)
- Unified Inbox → Queue → Library mental model
- AI-based Types + Topics instead of folders/tags
- Temporary Projects as pinboards, not storage
- Behavior-driven Queue ranking (the app learns from you)
- Beautiful mixed-media masonry library
- Consumption + curation + research in one place

No competitor blends these vectors. This is a new category.

---

## 15. User Scenarios — A Day in the Life
Below are realistic, narrative-style scenarios tailored to **your actual day-to-day patterns**, illustrating how Internet Shelf becomes an extension of your browsing, research, fitness, travel planning, and work routines.

---

### **Scenario 1: Morning Coffee — Light Capture**
You wake up in Barcelona, open X (Twitter) on your phone while making coffee.
- You see a great thread about **AI prompting for product designers** → share to Internet Shelf → **Inbox**
- A friend sends a TikTok about **hybrid athlete training** → share → **Inbox**
- An article on Substack about **LLM UX patterns** pops up → save → **Inbox**

No decisions. No organization. Capture everything effortlessly.

---

### **Scenario 2: Midday Work Session — Research Mode**
During work (collaborating with US teammates), you jump between Slack, GitHub, WorkOS dashboards, and documents.
- You find an AWS IAM doc related to RBAC modeling → Save → **Inbox**
- Someone shares a GitHub repo with a clean permissions tree → Save → **Inbox**
- You open a Figma file with a clever UI pattern → Save screenshot → **Inbox**

Later, while preparing for a design session:
- You open **Projects → “RBAC UI Exploration”**
- Pin 4 items from your Inbox (IAM doc, GitHub repo, article, Figma inspo)
- Keep everything else in Inbox or let it auto-archive

Your project space acts like a temporary pinboard — zero duplication, zero folders.

---

### **Scenario 3: Afternoon Gym — Consumption Between Sets**
At the gym in Eixample, between sets:
- You open **Queue**
- TikToks and YouTube Shorts surface as vertical previews
- A saved Hyrox technique video appears
- A 2-minute hybrid training tip video is recommended near the top

You watch one or two items. Finished content automatically moves to **Archive**.

---

### **Scenario 4: Evening Travel Planning — Inspiration Mode**
You and Ahmed are planning the Bali trip after your Singapore conference.
- You save 4 hotel pages, 2 YouTube villa reviews, and a travel blog → all land in **Inbox**
- You create a Project **“Bali July 2025”**
- Pin your favorite villas, restaurants, temple guides, and beach lists
- The rest stays in Inbox until auto-archived

Your **Library** automatically starts clustering Bali-related Topics:
- “Indonesia Travel”
- “Uluwatu Villas”
- “Sidemen Nature Retreats”

---

### **Scenario 5: Late Night Relaxation — Cinematic Consumption Mode**
Before bed, in your relaxing bedroom lighting:
- You open the **Queue**, which feels like a personalized Netflix
- A long AI video breakdown surfaces because you completed similar videos last night
- A design systems article is recommended because of your recent project
- Short TikToks are grouped so they don’t overwhelm

The Queue becomes your nightly curated digital TV.

---

### **Scenario 6: Weekend — Deep Work and Cleanup**
On Saturday morning, while reorganizing life:
- You browse **Library**, using Types/Topics filters
- You review saved recipes for the week
- You find a great article about circadian rhythm
- You archive stale Inbox items with one tap

AI gently surfaces:
- “12 items older than 30 days — archive?”
- “3 articles related to LLM UX you haven’t read yet.”

No guilt. Just soft cues.

---

### **Scenario 7: Travel Days — Offline-First Consumption**
On a flight from Barcelona → Trondheim:
- The Queue pre-downloads long reads, videos, and threads
- You consume half of them during the flight
- High-value items get manually moved to **Library**
- Everything else flows to **Archive** once consumed

---

### **Scenario 8: Long-Term Evolution — Behavior Learning**
Over months, Internet Shelf learns:
- You prefer long-form videos at night
- You read articles mostly on weekends
- You save many fitness items but only consume the best ones
- You pin travel content aggressively during trip planning periods
- You love design patterns related to UI density and Tailwind

Queue becomes hyper-personal.  
Library becomes elegant and minimal.  
Projects appear and disappear naturally.

---

## 16. Summary
Internet Shelf is a new kind of "Internet Player" — part library, part feed, part inspiration board, part research companion. It embraces the reality of modern browsing: mixed formats, chaotic flows, constant discovery. It gives users a place to keep what matters, consume what they love, and let the rest fade away.

The guiding mantra:
**Capture easily. Consume joyfully. Organize lightly.******

Internet Shelf is a new kind of "Internet Player" — part library, part feed, part inspiration board, part research companion. It embraces the reality of modern browsing: mixed formats, chaotic flows, constant discovery. It gives users a place to keep what matters, consume what they love, and let the rest fade away.

The guiding mantra:
**Capture easily. Consume joyfully. Organize lightly.******
Internet Shelf is a new kind of "Internet Player" — part library, part feed, part inspiration board, part research companion. It embraces the reality of modern browsing: mixed formats, chaotic flows, constant discovery. It gives users a place to keep what matters, consume what they love, and let the rest fade away.

The guiding mantra:
**Capture easily. Consume joyfully. Organize lightly.******

