# Current Focus

**Last Updated:** November 30, 2025
**Session:** Link Capture System + Local Development Setup

## ✅ Completed This Session

### Link Capture System

- [x] API endpoint (`/api/items`) with Bearer token authentication
- [x] API key management UI in user menu (view, copy, regenerate)
- [x] WXT browser extension with popup UI and keyboard shortcut
- [x] PWA manifest with share_target for mobile
- [x] Serwist service worker for offline support
- [x] Real-time sync via Supabase Realtime

### Local Development Setup

- [x] Supabase CLI initialization
- [x] Initial schema migration (`20251130000000_initial_schema.sql`)
- [x] Local Supabase configuration
- [x] Environment variable templates (`env.example`)
- [x] Comprehensive documentation

### Documentation

- [x] Production checklist with deployment guides
- [x] Personal use / dogfooding setup guide
- [x] Database migration strategy
- [x] Updated README with complete setup instructions

## 🚀 How to Use

### Local Development

```bash
supabase start          # Start local Supabase (Docker)
supabase db reset       # Run migrations
pnpm dev               # Start Next.js
```

### Browser Extension

```bash
cd extension
pnpm dev               # Dev mode
pnpm build             # Production build
# Load extension/.output/chrome-mv3/ in Chrome
```

### Deploy to Production

```bash
vercel --prod          # Deploy webapp
# Set env vars in Vercel dashboard
```

## 🔄 Next Steps

1. **Test Local Supabase** — Verify migrations work with `supabase start`
2. **Deploy to Vercel** — Personal use / dogfooding
3. **OAuth Login for Extension** — Replace manual API key entry
4. **Publish Extension** — Chrome Web Store / Firefox Add-ons
5. **Test PWA Share Target** — On iOS/Android after deployment

## 📁 Key Files Changed

| File                                   | Purpose                           |
| -------------------------------------- | --------------------------------- |
| `src/app/api/items/route.ts`           | API endpoint for external capture |
| `src/components/layout/user-menu.tsx`  | API key management UI             |
| `extension/`                           | WXT browser extension             |
| `public/manifest.json`                 | PWA with share_target             |
| `supabase/migrations/`                 | Database schema as code           |
| `.agents/docs/production-checklist.md` | Deployment guide                  |
| `README.md`                            | Updated project documentation     |

## ✅ Previous Sessions

- Theme Picker with Profile Persistence
- Layout Toggle System (sidebar/topbar)
- Unified Collection Refactor (Everything/Later/Favorites)
