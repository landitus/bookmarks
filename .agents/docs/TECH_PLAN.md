# Technical Plan & Architecture: Internet Shelf (v0.1)

## 1. Philosophy & Approach
**Goal:** Build a robust, simple, and readable application using Next.js, keeping the mental model close to **MVC (Rails)** and avoiding complex React Client-Side logic (excessive `useEffect`, state syncing) where possible.

### The "Rails-like" Next.js Mental Model
We will leverage the **Next.js App Router** to mimic the simplicity of server-side frameworks.

**Why not React Query (TanStack Query)?**
While powerful, React Query shifts data fetching to the *client*, requiring more hooks (`useQuery`, `useEffect`, `isLoading` states) and API endpoints. For a Rails developer, **Server Components** are more intuitive: you fetch data linearly on the server (`const data = await db.get()`) before rendering, just like a Controller.

| Concept | Rails / MVC Equivalent | Next.js Implementation |
| :--- | :--- | :--- |
| **Routing** | `config/routes.rb` | File-system routing (`app/inbox/page.tsx`) |
| **Controller (GET)** | Controller Action (e.g., `def index`) | The `async function Page()` component. It fetches data directly. |
| **Controller (POST)** | Controller Action (e.g., `def create`) | **Server Actions** (`actions.ts`). Functions called directly from forms. |
| **Views** | ERB / Slim Templates | JSX Components (Server Components by default). |
| **Models** | ActiveRecord Models | TypeScript Interfaces + Supabase Client (Typed). |
| **State** | Params / Session | **URL Search Params** (for filters/sort) + Cookies (Auth). |

**Key Rule:** Logic lives on the server. The client is strictly for *interactivity* (hover states, opening modals, immediate feedback).

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 15+ (App Router).
- **Language:** TypeScript (Strict mode, but keeping types simple: `Item`, `Project`).
- **Styling:** Tailwind CSS.
- **Components:** shadcn/ui (Headless accessible components + Tailwind).
- **Icons:** Lucide React.
- **Fonts:** Inter or generic system fonts for v0.1.

### Backend & Data
- **Database:** Supabase (PostgreSQL).
- **Auth:** Supabase Auth (Social + Email).
- **Storage:** Supabase Storage (for screenshot fallbacks/thumbnails).
- **ORM-lite:** Supabase JS Client (strongly typed based on DB schema).

### External Services (v0.1)
- **Metadata Scraping:** `metascraper` (Node.js library) running in Server Actions.
- **AI Topics:** OpenAI (GPT-4o-mini) via Server Actions.

---

## 3. Data Model (Supabase Schema)

We will keep the schema normalized but simple.

### `profiles` (Users)
- `id` (UUID, PK)
- `email`
- `full_name`
- `avatar_url`

### `items` ( The Core Object)
- `id` (UUID, PK)
- `user_id` (FK -> profiles)
- `url` (text)
- `title` (text)
- `description` (text)
- `image_url` (text)
- `type` (enum: 'video', 'article', 'thread', 'image')
- `status` (enum: 'inbox', 'queue', 'library', 'archive')
- `metadata` (jsonb - stores raw scrape data, duration, author)
- `created_at`
- `updated_at`

### `topics` (Tags)
- `id` (UUID)
- `user_id` (FK)
- `name` (text)
- `slug` (text)

### `item_topics` (Join Table)
- `item_id` (FK)
- `topic_id` (FK)

### `projects` (Collections)
- `id` (UUID)
- `user_id` (FK)
- `name` (text)
- `description` (text)

### `project_items` (Pins)
- `project_id` (FK)
- `item_id` (FK)
- `position` (int - for ordering)

---

## 4. Directory Structure (Feature-Driven)
To keep files small and readable, we avoid a giant `components` folder. We group by **Feature Domain** where possible.

```
/src
  /app                 # Routes (Controllers + Views)
    /layout.tsx        # Main Application Shell
    /page.tsx          # Marketing / Landing
    /inbox/
      page.tsx         # Inbox View
    /queue/
      page.tsx         # Queue View
    /library/
      page.tsx         # Library View
    /projects/
      page.tsx
      [id]/
        page.tsx

  /components          # Shared UI Components
    /ui/               # shadcn/ui primitives (Button, Card, Input)
    /layout/           # Shell, Sidebar, Header
    /items/            # Item-specific components
      item-card.tsx    # Polymorphic card
      item-actions.tsx # Dropdowns/Buttons
    /projects/         # Project-specific components

  /lib                 # Utilities
    /supabase/         # Database client setup
    /actions/          # Server Actions (Controller logic)
      items.ts         # createItem, updateItemStatus
      projects.ts
    /utils.ts          # Helpers (cn, formatting)
    /types.ts          # Shared Types
```

---

## 5. Component Patterns

### The "Smart" Server Component (Page)
Instead of `useEffect` to fetch data, the Page does the work.

```tsx
// app/inbox/page.tsx
export default async function InboxPage() {
  const items = await getInboxItems(); // Database call directly here

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Inbox</h1>
      <div className="grid grid-cols-3 gap-4">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### The "Dumb" Client Component (Interactivity)
Used only when interaction is needed.

```tsx
// components/items/item-card.tsx
'use client'

export function ItemCard({ item }: { item: Item }) {
  // Only use client hook if we need local UI state like hover menus
  return (
    <Card>
      <CardImage src={item.image_url} />
      <CardContent>
        <h3>{item.title}</h3>
        <ArchiveButton id={item.id} /> {/* Server Action trigger */}
      </CardContent>
    </Card>
  )
}
```

### Server Actions (The "Controller" Logic)
We don't write `/api/items/create`. We write functions.

```ts
// lib/actions/items.ts
'use server'

export async function archiveItem(id: string) {
  await supabase.from('items').update({ status: 'archive' }).eq('id', id);
  revalidatePath('/inbox'); // Rails "redirect_to" or refresh equivalent
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Days 1-2)
1. Initialize Next.js + Tailwind + shadcn.
2. Setup Supabase Project (Locally or Cloud).
3. Create Database Schema.
4. Build App Shell (Sidebar/Layout).

### Phase 2: Capture & Inbox (Days 3-4)
1. Create `Item` CRUD Server Actions.
2. Implement URL pasting -> Metadata fetch (Microlink).
3. Build `Inbox` view (Grid/List).

### Phase 3: Organization (Days 5-6)
1. Implement `Queue` view.
2. Implement `Library` view.
3. Add Drag & Drop or simple "Move to" dropdowns.

### Phase 4: Projects & Polish (Days 7+)
1. Projects CRUD.
2. Pinning items to projects.
3. Refine UI/UX (Loading states, empty states).
