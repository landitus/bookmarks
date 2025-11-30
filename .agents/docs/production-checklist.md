# Production Checklist

---

## Personal Use / Dogfooding Setup

A simpler setup for using the app yourself before full public launch. Keeps production data safe while allowing local experimentation.

### 1. Database Strategy: Production vs Local

**Option A: Two Supabase Projects (Recommended)**
- **Production**: Your existing `bookmarks` project - real data, don't experiment here
- **Local/Dev**: Create a new Supabase project called `bookmarks-dev` for experimentation

```bash
# .env.local (for local development - points to dev database)
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key

# .env.production (for Vercel - points to production database)
NEXT_PUBLIC_SUPABASE_URL=https://sqyarjblpozowlqluasg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
```

**Option B: Same Database, Different Users**
- Use your production database but create a "test" user account
- Less safe - schema changes affect production

**Setting up the dev database:**
1. Create new Supabase project (free tier is fine)
2. Run the same migrations on it
3. Enable Realtime on `items` table
4. Create a test user account

### 2. Deploy to Vercel (Personal Use)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (first time - will ask questions)
vercel

# For subsequent deploys
vercel --prod
```

**Vercel Environment Variables:**
1. Go to your project on vercel.com → Settings → Environment Variables
2. Add production Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL (e.g., `https://portable.vercel.app`)

### 3. Install Extension Locally (No Store Needed)

**Chrome:**
1. Build the extension:
   ```bash
   cd extension
   pnpm build
   ```
2. Open `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select `extension/.output/chrome-mv3/` folder
6. Done! Extension is now installed

**Update extension after changes:**
1. Rebuild: `pnpm build`
2. Go to `chrome://extensions/`
3. Click refresh icon on Portable extension

**Configure for production:**
- Open extension popup → Settings
- Set Server URL to your Vercel URL (e.g., `https://portable.vercel.app`)
- Paste your API key from the production webapp

### 4. Install PWA on Phone

**iOS (Safari):**
1. Open your Vercel URL in Safari (not Chrome)
2. Tap Share button (square with arrow)
3. Scroll down, tap "Add to Home Screen"
4. Name it "Portable" → Add
5. App icon appears on home screen

**Android (Chrome):**
1. Open your Vercel URL in Chrome
2. Tap menu (three dots)
3. Tap "Add to Home screen" or "Install app"
4. Confirm

**Test Share Target:**
1. After installing PWA, share any link from another app
2. "Portable" should appear in the share sheet
3. Tap it → link saves automatically

### 5. Quick Setup Checklist

```
□ Create bookmarks-dev Supabase project (for local experiments)
□ Run migrations on dev project
□ Set up .env.local with dev credentials
□ Deploy to Vercel with production credentials
□ Build and load extension locally in Chrome
□ Configure extension with production URL + API key
□ Install PWA on phone
□ Test the full flow:
  □ Save link from extension → appears in webapp
  □ Save link from PWA share → appears in webapp
  □ Real-time updates work
```

### 6. Daily Workflow

**Local development (safe to experiment):**
```bash
pnpm dev  # Uses .env.local → dev database
```

**Production app (your real data):**
- Visit your Vercel URL
- Use the browser extension
- Use the PWA on phone

**Extension development:**
```bash
cd extension
pnpm dev  # Hot reload, points to localhost:3000
```

### 7. Keeping Data Safe

| Environment | Database | Purpose |
|------------|----------|---------|
| `pnpm dev` | Dev Supabase | Experiment freely |
| Vercel | Prod Supabase | Real bookmarks |
| Extension (localhost) | Dev Supabase | Test extension |
| Extension (vercel URL) | Prod Supabase | Real use |
| PWA | Prod Supabase | Real use |

**Golden rule:** Never put production credentials in `.env.local`

---

## Full Production Checklist

For public launch with real users.

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
