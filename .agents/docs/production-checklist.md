# Production Checklist

## Webapp Deployment

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production service role key (keep secret!)
- [ ] `NEXT_PUBLIC_SITE_URL` - Production URL (e.g., `https://portable.app`)

### Supabase Configuration
- [ ] Enable RLS on all tables
- [ ] Review and test RLS policies
- [ ] Enable Realtime on `items` table (already done)
- [ ] Set up database backups
- [ ] Configure rate limiting on Edge Functions (if used)

### PWA Setup
- [ ] Update `manifest.json` with production URLs
- [ ] Generate proper PNG icons (192x192, 512x512) for better mobile support
- [ ] Test PWA installation on iOS and Android
- [ ] Test share target functionality on mobile
- [ ] Verify service worker caching strategy

### Security
- [ ] Audit API endpoints for authentication
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is never exposed client-side
- [ ] Set up CORS to allow only your domains (currently `*`)
- [ ] Add rate limiting to `/api/items` endpoint
- [ ] Consider adding API key rotation reminders

### Performance
- [ ] Enable Next.js ISR/caching where appropriate
- [ ] Optimize images with next/image
- [ ] Review bundle size
- [ ] Set up error monitoring (Sentry, etc.)

---

## Browser Extension

### Before Publishing

#### Update Configuration
- [ ] **Hardcode production URL** in `extension/entrypoints/popup/main.ts`:
  ```typescript
  const DEFAULT_SERVER_URL = "https://portable.app"; // Change from localhost
  ```
- [ ] Update `extension/wxt.config.ts` with production metadata
- [ ] Update version number for each release

#### Chrome Web Store
1. **Create Developer Account** ($5 one-time fee)
   - https://chrome.google.com/webstore/devconsole
   
2. **Prepare Assets**
   - [ ] Icon 128x128 PNG (store listing)
   - [ ] Screenshots (1280x800 or 640x400)
   - [ ] Promotional images (optional: 440x280, 920x680, 1400x560)
   - [ ] Short description (132 chars max)
   - [ ] Detailed description

3. **Build for Production**
   ```bash
   cd extension
   pnpm build
   pnpm zip  # Creates .zip for upload
   ```

4. **Submit for Review**
   - Upload `.output/chrome-mv3.zip`
   - Fill in store listing
   - Privacy policy URL (required)
   - Justify permissions used

#### Firefox Add-ons
1. **Create Developer Account** (free)
   - https://addons.mozilla.org/developers/
   
2. **Build for Firefox**
   ```bash
   cd extension
   pnpm build:firefox
   pnpm zip:firefox
   ```

3. **Submit for Review**
   - Upload `.output/firefox-mv3.zip`

### Post-Publishing

- [ ] Add "Install Extension" banner to webapp for users without extension
- [ ] Detect if extension is installed (via content script messaging)
- [ ] Set up auto-update mechanism (handled by stores)

---

## Future Improvements (Post-Launch)

### Extension UX
- [ ] **OAuth Login Flow** - Replace manual API key with "Login with Portable" button
  - Extension opens webapp login in popup
  - After auth, redirects with token
  - Extension stores token automatically
  
- [ ] **Context Menu** - Right-click to save links/images
- [ ] **Badge Notifications** - Show count of unsaved items
- [ ] **Offline Queue** - Save links when offline, sync when back online

### Webapp
- [ ] **Install Extension Prompt** - Detect browser and show install CTA
- [ ] **QR Code Pairing** - Alternative setup method for extension
- [ ] **API Key Management** - Show last used, expiration, multiple keys

### Mobile PWA
- [ ] **iOS-specific meta tags** for better Add to Home Screen experience
- [ ] **Splash screens** for iOS
- [ ] **Push notifications** for new items (optional)

---

## Quick Reference: Extension Build Commands

```bash
# Development
cd extension
pnpm dev              # Chrome dev mode
pnpm dev:firefox      # Firefox dev mode

# Production
pnpm build            # Build for Chrome
pnpm build:firefox    # Build for Firefox
pnpm zip              # Create Chrome .zip for store
pnpm zip:firefox      # Create Firefox .zip for store

# Icons
node scripts/generate-icons.mjs  # Regenerate PNG icons
```

## Quick Reference: Webapp Deployment

```bash
# Build
pnpm build --webpack  # Use webpack (required for Serwist)

# Deploy (example for Vercel)
vercel --prod
```

