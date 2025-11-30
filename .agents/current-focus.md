# Current Focus

**Last Updated:** November 30, 2025
**Session:** Link Capture System - COMPLETED

## ✅ Completed: Link Capture System

Successfully implemented external link capture with real-time sync:

### Phase 1: API Layer

- [x] Added `api_key` column to profiles table (UUID with auto-generation)
- [x] Created `/api/items` POST endpoint with Bearer token auth
- [x] Added API key management UI in user menu (view, copy, regenerate)
- [x] CORS headers for cross-origin requests

### Phase 2: PWA Setup

- [x] Created `manifest.json` with share_target config
- [x] Set up Serwist service worker for offline support
- [x] Created `/share` page to handle incoming share intents
- [x] Added SVG icons for PWA

### Phase 3: Browser Extension (WXT)

- [x] Initialized WXT project in `/extension`
- [x] Built popup UI with warm Portable aesthetic
- [x] Integrated settings for API key and server URL
- [x] Keyboard shortcut (Cmd+Shift+S / Ctrl+Shift+S)

### Bonus: Real-time Sync

- [x] Enabled Supabase Realtime on items table
- [x] Added realtime subscription in ItemsView
- [x] Webapp auto-refreshes when items added via extension

## 🚀 Usage

### Browser Extension

```bash
cd extension
pnpm dev          # Dev mode (Chrome)
pnpm build        # Production build → .output/chrome-mv3/
```

### API Endpoint

```bash
curl -X POST https://your-app.com/api/items \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 🔄 Next Steps

1. Implement OAuth login flow for extension (better UX than manual API key)
2. Publish extension to Chrome Web Store
3. Add "Install Extension" banner to webapp
4. Test PWA share target on mobile after deployment

See [Production Checklist](docs/production-checklist.md) for full deployment guide.

## ✅ Previous Sessions

- Theme Picker with Profile Persistence
- Layout Toggle System (sidebar/topbar)
- Unified Collection Refactor (Everything/Later/Favorites)
