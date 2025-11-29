# Unified Collection Architecture Refactor

**Created:** November 28, 2025  
**Status:** In Progress  
**Branch:** `refactor/unified-collection`

## Summary

Refactor from linear pipeline (Inbox → Queue → Library) to unified collection with boolean filters (Later, Favorites), keeping Archive as separate hidden state.

## Motivation

The original model treated items as moving through stages:

- Inbox (unsorted) → Queue (to consume) → Library (keepers) → Archive (done)

This was limiting because:

1. Items could only be in one state
2. Moving items felt like work
3. Mental overhead of "where does this go?"

The new model:

- **Everything** — All non-archived items live here
- **Later** — Boolean flag for "watch/read later"
- **Favorites** — Boolean flag for starred/saved items
- **Archive** — Separate hidden state

Key benefit: An item can be BOTH "Later" AND "Favorite" simultaneously.

## Database Changes

### Old Schema

```typescript
export type ItemStatus = "inbox" | "queue" | "library" | "archive";

export interface Item {
  status: ItemStatus;
  // ...
}
```

### New Schema

```typescript
export interface Item {
  is_later: boolean; // Replaces "queue" status
  is_favorite: boolean; // Replaces "library" status
  is_archived: boolean; // Replaces "archive" status
  // Remove: status: ItemStatus;
}
```

### Migration Steps

1. Add `is_later`, `is_favorite`, `is_archived` boolean columns (default false)
2. Migrate existing data:
   - `status = 'queue'` → `is_later = true`
   - `status = 'library'` → `is_favorite = true`
   - `status = 'archive'` → `is_archived = true`
3. Drop `status` column

## Route Changes

| Old Route  | New Route     | Purpose                   |
| ---------- | ------------- | ------------------------- |
| `/inbox`   | `/everything` | Everything view (default) |
| `/queue`   | `/later`      | Filtered: Later items     |
| `/library` | `/favorites`  | Filtered: Favorite items  |

## Server Actions Changes

### Queries

- `getItems()` → `WHERE is_archived = false` (Everything)
- `getLaterItems()` → `WHERE is_later = true AND is_archived = false`
- `getFavoriteItems()` → `WHERE is_favorite = true AND is_archived = false`

### Mutations

- `toggleLater(itemId)` → Toggle `is_later` boolean
- `toggleFavorite(itemId)` → Toggle `is_favorite` boolean
- `archiveItem(itemId)` → Set `is_archived = true`
- `unarchiveItem(itemId)` → Set `is_archived = false`

## UI Changes

### Item Actions (dropdown menu)

Old:

- "Move to Queue"
- "Move to Library"
- "Archive"

New:

- "Add to Later" / "Remove from Later" (toggle, shows current state)
- "Add to Favorites" / "Remove from Favorites" (toggle, shows current state)
- "Archive" (destructive)

### Sidebar Navigation

Old:

- Inbox
- Queue
- Library

New:

- Everything
- Later
- Favorites

## Files to Modify

1. `src/lib/types.ts` — Update Item interface
2. `src/lib/actions/items.ts` — Update queries and add toggle actions
3. `src/app/(protected)/` — Restructure routes
4. `src/components/items/item-actions.tsx` — Toggle-based actions
5. `src/components/layout/sidebar.tsx` — New navigation labels
6. `src/components/items/items-view.tsx` — Update addItemTargetStatus logic
7. `.agents/` docs — Update with new architecture

## Implementation Order

1. [ ] Create Supabase migration
2. [ ] Update types.ts
3. [ ] Refactor server actions
4. [ ] Restructure routes
5. [ ] Update ItemActions component
6. [ ] Update sidebar
7. [ ] Update agent docs
