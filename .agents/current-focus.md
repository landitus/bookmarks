# Current Focus

**Last Updated:** November 29, 2025
**Session:** Layout Toggle System

## 🎯 Current Session Focus
**Completed!** Implemented layout toggle system with encapsulated sidebar and topbar layouts.

## ✅ What We Just Completed
**Layout Toggle System**
- ✅ Created layout config system (`src/lib/config.ts`) with `LAYOUT_MODE` constant
- ✅ Encapsulated sidebar layout in `src/components/layout/sidebar/` folder
- ✅ Encapsulated topbar layout in `src/components/layout/topbar/` folder
- ✅ Updated topbar navigation routes to match current routes (`/everything`, `/later`, `/favorites`)
- ✅ Created unified layout export (`src/components/layout/index.ts`) that selects active layout based on config
- ✅ Updated protected layout to use config-driven `ActiveLayout` component
- ✅ Cleaned up old layout files (`sidebar.tsx`, `top-nav.tsx`)
- ✅ Default layout set to `"topbar"` for testing

**Previous Session: Unified Collection Refactor**
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
