# Unified Collection Architecture Refactor

**Created:** November 28, 2025  
**Status:** In Progress  
**Branch:** `refactor/unified-collection`

## Summary

Replace the `status` enum with boolean flags. All items live in "Everything" and can be tagged as "Later" and/or "Favorites". Archive remains a separate hidden state.

## Naming Decisions

| Old Name | New Name | Type |
|----------|----------|------|
| Inbox | Everything | Main view (all non-archived items) |
| Queue | Later | Boolean filter (`is_later`) |
| Library | Favorites | Boolean filter (`is_favorite`) |
| Archive | Archive | Separate state (`is_archived`) |

**Key Benefit:** An item can now be BOTH "Later" AND "Favorite" simultaneously.

## Database Changes

Update `src/lib/types.ts`:
```typescript
// Remove: export type ItemStatus = "inbox" | "queue" | "library" | "archive";

export interface Item {
  // ... existing fields
  is_later: boolean;      // Replaces "queue" status
  is_favorite: boolean;   // Replaces "library" status  
  is_archived: boolean;   // Replaces "archive" status
  // Remove: status: ItemStatus;
}
```

Create Supabase migration to:
1. Add `is_later`, `is_favorite`, `is_archived` boolean columns (default false)
2. Migrate existing data: `queue` → `is_later=true`, `library` → `is_favorite=true`, `archive` → `is_archived=true`
3. Drop `status` column

## Route Changes

| Old Route | New Route | Purpose |
|-----------|-----------|---------|
| `/inbox` | `/` (root) | Everything view (default) |
| `/queue` | `/later` | Filtered: Later items |
| `/library` | `/favorites` | Filtered: Favorite items |

Update `src/app/(protected)/` directory structure.

## Server Actions

Update `src/lib/actions/items.ts`:
- `getItems()` → filter by `is_archived = false` for Everything
- `getLaterItems()` → filter by `is_later = true AND is_archived = false`
- `getFavoriteItems()` → filter by `is_favorite = true AND is_archived = false`
- `toggleLater(itemId)` → toggle `is_later` boolean
- `toggleFavorite(itemId)` → toggle `is_favorite` boolean
- `archiveItem(itemId)` → set `is_archived = true`

## UI Changes

Update `src/components/items/item-actions.tsx`:
- Replace "Move to Queue/Library" with toggle actions
- "Add to Later" / "Remove from Later" (toggle)
- "Add to Favorites" / "Remove from Favorites" (toggle)
- Keep "Archive" as destructive action

Update sidebar in `src/components/layout/sidebar.tsx`:
- Rename navigation: Everything, Later, Favorites

## Files to Modify

1. `src/lib/types.ts` — Update Item interface
2. `src/lib/actions/items.ts` — Update queries and add toggle actions
3. `src/app/(protected)/` — Restructure routes
4. `src/components/items/item-actions.tsx` — Toggle-based actions
5. `src/components/layout/sidebar.tsx` — New navigation labels
6. `src/components/items/items-view.tsx` — Update addItemTargetStatus logic
7. `.agents/` docs — Update with new architecture

## Implementation Order

1. Create Supabase migration: add boolean columns, migrate data, drop status
2. Update Item interface in types.ts with new boolean fields
3. Refactor server actions: getItems, toggleLater, toggleFavorite, archive
4. Restructure routes: / (Everything), /later, /favorites
5. Update ItemActions component with toggle-based actions
6. Update sidebar navigation labels
7. Update .agents/ documentation with new architecture

