# Key Decisions Log (Quick Reference)

## Architecture Decisions

### Tech Stack

- **Next.js App Router:** Chosen for server-side simplicity and performance.
- **Supabase:** Chosen for speed of setup (Auth + DB + Storage) and easy Row Level Security.

### Mental Model: "Rails-like"

- **Decision:** We treat Next.js Server Components like "Controllers" and Client Components like "Views".
- **Why:** Simplicity. Keeps logic on the server, reduces client-side state complexity.

## Technical Decisions

### No TanStack Query

- **Decision:** Use direct Server Actions and Server Components instead of TanStack Query.
- **Why:**
  1. **Simplicity:** Avoids managing `isLoading`/`useEffect` chains on the client.
  2. **Mental Model:** Matches the "Rails" approach (fetch -> render).
  3. **Performance:** Data fetching happens close to the DB.
- **Trade-off:** Less "live" out of the box (requires `revalidatePath`), but simpler code.

### Feature-Driven Directory Structure

- **Decision:** Group files by domain (`components/items`, `app/inbox`) rather than type.
- **Why:** Better collocation of related logic.

### Metadata Scraping: metascraper (not Microlink)

- **Decision:** Use `metascraper` (local Node.js library) instead of Microlink API.
- **Why:**
  1. **Cost:** No external API costs.
  2. **Simplicity:** No API keys to manage.
  3. **Control:** Runs in Server Actions, full control over scraping logic.
- **Trade-off:** Less robust for complex sites (no headless browser), but sufficient for v0.1.

## Product Decisions

### "Inbox" First

- **Decision:** All new saves go to Inbox first.
- **Why:** Reduces friction at capture time. "Decide later."

### Brand Name: "Portable"

- **Decision:** App is called "Portable" with tagline "A little pocket for the internet things you love."
- **Why:** Personal, friendly, memorable. Evokes portability and coziness.

## UI/UX Decisions

### Visual Aesthetic: Warm & Minimal

- **Decision:** Use warm cream background (#FFFBF7) with amber/orange/rose gradient accents.
- **Why:**
  1. **Differentiation:** Stands out from cold "tech" aesthetics.
  2. **Personality:** Feels cozy, personal, inviting.
  3. **Consistency:** Applied across landing and auth pages.
- **Details:**
  - Subtle noise texture for depth
  - Animated gradient orbs (soft, not distracting)
  - Neutral-900 for primary text/buttons
  - Rounded corners (xl/2xl) throughout

### Auth Page Hierarchy

- **Decision:** Single title per page. Logo is icon-only, page title is the focal point.
- **Why:** Avoids competing elements. "Welcome back" or "Create your account" is the single heading.
- **Details:**
  - Logo icon links back to home
  - Cardless form design (cleaner, more modern)
  - Rounded inputs with backdrop blur

### Auth Flow

- **Decision:** Collect Full Name during signup (not just email/password).
- **Why:** Personalization. Shows real name in UI instead of email username.

### User Menu Design

- **Decision:** Minimal, elegant dropdown (Linear/Raycast-inspired) over traditional navbar avatar.
- **Why:** Modern aesthetic, cleaner sidebar, better use of space.
- **Details:**
  - Subtle zinc color palette (not loud gradients).
  - Email hidden by default, shown in dropdown.
  - Floating menu with rounded corners and shadow.
