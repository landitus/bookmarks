# Current Focus

**Last Updated:** January 3, 2026
**Branch:** `main`
**Status:** Inbox/Library/Archive UX Overhaul - Complete & Merged ✅

## 🎉 Recently Completed

### Inbox/Library/Archive UX Model (Jan 3, 2026)

Restructured the app around a triage-based workflow: **Capture → Consume → Keep or Discard**

- [x] Database migration: Added `is_kept`, `kept_at`, `archived_at` columns
- [x] Updated types.ts: `is_kept` replaces `is_later`
- [x] New server actions: `keepItem()`, `discardItem()`, `restoreItem()`
- [x] Created new routes: `/inbox`, `/library`, `/archive`
- [x] Deleted old routes: `/everything`, `/later`, `/favorites`
- [x] Updated navigation: Inbox/Library/Archive tabs
- [x] Context-aware ItemActions component
- [x] Reader view triage buttons (Keep/Discard in header)
- [x] Toast notifications for all actions
- [x] Smart sorting: Inbox by capture date, Library by kept_at, Archive by archived_at
- [x] Flat list view for Library/Archive (no date grouping)
- [x] Legacy route redirects in middleware
- [x] Updated seed data with 3 favorites, realistic triage states

## 🚀 Next Steps

- [ ] Apply migration to production database
- [ ] Test full flow end-to-end
- [ ] Update extension if needed

## 📁 Key Files Changed

| File                                                         | Change                                 |
| ------------------------------------------------------------ | -------------------------------------- |
| `supabase/migrations/20260103000000_inbox_library_model.sql` | New migration adding `is_kept` column  |
| `src/lib/types.ts`                                           | Updated Item interface                 |
| `src/lib/actions/items.ts`                                   | New triage actions                     |
| `src/app/(protected)/inbox/page.tsx`                         | New Inbox page                         |
| `src/app/(protected)/library/page.tsx`                       | New Library page with favorites filter |
| `src/app/(protected)/archive/page.tsx`                       | New Archive page                       |
| `src/components/layout/topbar/topbar-nav.tsx`                | Updated navigation                     |
| `src/components/items/item-actions.tsx`                      | Context-aware actions with toast       |
| `src/components/items/items-view.tsx`                        | Updated for new model                  |
| `src/app/(reader)/items/[id]/item-reader-view.tsx`           | Triage buttons in header               |
| `src/middleware.ts`                                          | Legacy route redirects                 |

## 🧭 Data Model

| Bucket  | Condition                                 | Sort By       |
| ------- | ----------------------------------------- | ------------- |
| Inbox   | `is_kept = false AND is_archived = false` | `created_at`  |
| Library | `is_kept = true AND is_archived = false`  | `kept_at`     |
| Archive | `is_archived = true`                      | `archived_at` |

**Key columns:**

- `is_kept` - Whether item has been triaged to Library
- `kept_at` - Timestamp when item was moved to Library (for sorting)
- `archived_at` - Timestamp when item was archived (for sorting)

## 🔗 Related

- Plan: `.agents/docs/plans/2026-01-03-inbox-library-ux.md`
- Previous: Article Reader & AI Features (complete)
