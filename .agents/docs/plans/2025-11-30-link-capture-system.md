# Link Capture System (Browser Extension + PWA)

**Created:** November 30, 2025  
**Status:** Completed  
**Branch:** `feature/link-capture`

## Summary

Add external link capture via a WXT browser extension and PWA Share Target, backed by a new API layer for authenticated external requests.

## Motivation

Currently, links can only be saved from within the web app. Users need to:
- Save links directly from their browser while browsing
- Share links from their phone (iOS/Android share sheet)
- Have the app installable as a PWA for mobile browsing

## Architecture

```
[Browser Extension] ──POST──┐
                            ├──► /api/items ──► Supabase
[PWA Share Target] ──POST───┘
```

Both external capture methods POST to a new API route authenticated via API tokens stored in the user's profile.

---

## Phase 1: API Layer (Foundation)

### Database Changes

Add `api_token` column to `profiles` table:

```sql
ALTER TABLE profiles
ADD COLUMN api_token UUID DEFAULT gen_random_uuid() UNIQUE;
```

### API Route

Create `src/app/api/items/route.ts`:

- POST endpoint accepting `{ url: string }`
- Authenticate via `Authorization: Bearer <api_token>` header
- Reuse existing metascraper logic from `items.ts`
- Return JSON response with created item or error

### Token Management UI

Add to user menu or settings:
- Display current API token (copyable)
- Regenerate token button

### Files to Create/Modify

| File | Action |
|------|--------|
| `profiles` table | Add `api_token` column |
| `src/app/api/items/route.ts` | Create - API endpoint |
| `src/lib/actions/auth.ts` | Add `generateApiToken()` action |
| `src/components/layout/user-menu.tsx` | Add token UI section |

---

## Phase 2: PWA Setup

### PWA Manifest

Create `public/manifest.json`:

```json
{
  "name": "Portable",
  "short_name": "Portable",
  "description": "A little pocket for the internet things you love",
  "start_url": "/everything",
  "display": "standalone",
  "background_color": "#FFFBF7",
  "theme_color": "#F59E0B",
  "icons": [...],
  "share_target": {
    "action": "/share",
    "method": "GET",
    "params": {
      "url": "url",
      "title": "title",
      "text": "text"
    }
  }
}
```

### Service Worker

Use [Serwist](https://serwist.pages.dev/) for Next.js PWA support:
- Install `@serwist/next` and `serwist`
- Configure in `next.config.ts`
- Basic caching strategy for offline browsing

### Share Target Handler

Create `src/app/share/page.tsx`:
- Receives URL from share sheet via query params
- Auto-saves the URL using existing `createItem` logic
- Shows success feedback
- Redirects to `/everything`

### Files to Create/Modify

| File | Action |
|------|--------|
| `public/manifest.json` | Create - PWA manifest |
| `public/icons/` | Create - App icons (192x192, 512x512) |
| `src/app/sw.ts` | Create - Service worker |
| `next.config.ts` | Modify - Add Serwist config |
| `src/app/share/page.tsx` | Create - Share handler |
| `src/app/layout.tsx` | Modify - Add manifest link |

---

## Phase 3: WXT Browser Extension

### Initialize Extension

Create `/extension` directory with WXT:

```bash
cd extension
npx wxt@latest init
```

Configure for Chrome, Firefox, Safari targets.

### Extension Popup

Simple UI matching Portable's warm aesthetic:
- Current page title display
- "Save to Portable" button
- Success/error feedback
- Link to open Portable

### Extension Settings

Settings page for:
- Server URL (default: production URL)
- API token input
- Test connection button

### Extension Logic

- On popup open: Get current tab URL and title
- On save: POST to `/api/items` with Bearer token
- Keyboard shortcut: `Cmd+Shift+S` / `Ctrl+Shift+S`
- Badge indicator for save status

### Files to Create

| File | Purpose |
|------|---------|
| `/extension/wxt.config.ts` | WXT configuration |
| `/extension/entrypoints/popup/` | Popup UI |
| `/extension/entrypoints/background.ts` | Background script |
| `/extension/public/icon-*.png` | Extension icons |

---

## Implementation Order

1. [x] Phase 1: API Layer
   - [x] Add `api_key` column to profiles (with UUID default)
   - [x] Create `/api/items` POST endpoint with Bearer auth
   - [x] Add token management UI in user menu

2. [x] Phase 2: PWA Setup
   - [x] Create manifest.json with share_target
   - [x] Set up Serwist service worker
   - [x] Create `/share` handler page
   - [x] Add SVG icons for PWA

3. [x] Phase 3: Browser Extension
   - [x] Initialize WXT project in `/extension`
   - [x] Build popup UI with warm aesthetic
   - [x] Add settings for API key and server URL
   - [x] Configure keyboard shortcut (Cmd+Shift+S)

---

## Future Enhancements (Deferred)

- **OAuth login flow for extension**: Better UX than manual API key entry
- **Publish to Chrome Web Store**: For easy installation
- **Enhanced metadata extraction**: AI summarization, auto-topics (GPT-4o-mini)
- **Reader view**: Full article content extraction with `@mozilla/readability`
- **Background processing**: Async enrichment queue via Supabase Edge Functions
- **Reading time estimate**: Based on extracted content length

---

## Session Notes

### Issues Encountered & Fixed
1. **Login redirect to `/inbox`** → Fixed to redirect to `/everything`
2. **Missing `SUPABASE_SERVICE_ROLE_KEY`** → Required for API route to authenticate
3. **CORS errors** → Added CORS headers to all API responses
4. **Clipboard API not available** → Added fallback using textarea + execCommand
5. **Realtime not working** → Added user_id filter and set REPLICA IDENTITY FULL

