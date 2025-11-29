# Current Focus

**Last Updated:** November 29, 2025
**Session:** Unified Collection Architecture Refactor

## 🎯 Current Session Focus
**Completed!** Refactored from linear pipeline to unified collection with boolean filters.

## ✅ What We Just Completed
**Unified Collection Refactor**
- ✅ Replaced `status` enum with boolean flags (`is_later`, `is_favorite`, `is_archived`)
- ✅ Created new routes: `/everything`, `/later`, `/favorites`
- ✅ Implemented toggle actions (items can be BOTH Later AND Favorite)
- ✅ Added Next.js middleware for centralized auth routing
- ✅ Updated ItemActions with toggle-based menu
- ✅ Added visual badges (clock/star) in list and card views
- ✅ Removed old routes: `/inbox`, `/queue`, `/library`

## 🎉 Architecture Summary
**New Model:**
- **Everything** (`/everything`) — All non-archived items
- **Later** (`/later`) — Filter for items to watch/read later
- **Favorites** (`/favorites`) — Filter for starred items
- **Archive** — Separate hidden state

**Key Benefits:**
- Items can have multiple flags (both Later AND Favorite)
- Simpler mental model — one place for everything
- Filters instead of moving items between states

## 🔄 Next Steps (Phase 4: Polish & Projects)
1. Implement Projects (collections/boards)
2. Add Topics/Tags (AI-generated or manual)
3. Polish empty states and loading states
4. Add keyboard shortcuts
5. Build Archive view
