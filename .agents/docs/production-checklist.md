# Production Checklist

---

## Personal Use / Dogfooding Setup

A simpler setup for using the app yourself before full public launch. Keeps production data safe while allowing local experimentation.

### 1. Database Strategy: Production vs Local

**The Professional Approach: Migrations as Code**

All schema changes should be tracked as SQL migration files, not done manually in the Supabase dashboard. This ensures:

- Changes are version controlled
- Same migrations run on dev, staging, and production
- Easy to rollback if something breaks
- Team members stay in sync

**Environment Setup:**

| Environment                 | Purpose                        | Database             |
| --------------------------- | ------------------------------ | -------------------- |
| Local (`pnpm dev`)          | Daily development, experiments | Dev Supabase project |
| Preview (Vercel PR deploys) | Test branches before merge     | Dev or Branch DB     |
| Production (Vercel main)    | Real users, real data          | Production Supabase  |

```bash
# .env.local (local development - NEVER production creds here)
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key

# Vercel Environment Variables (production)
NEXT_PUBLIC_SUPABASE_URL=https://sqyarjblpozowlqluasg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
```

---

### Migration Workflow (How the Pros Do It)

**Option A: Supabase CLI + Local Migrations (Recommended)**

This is the standard approach used by most teams:

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Link to your project
supabase login
supabase link --project-ref sqyarjblpozowlqluasg

# 3. Pull existing schema (first time only)
supabase db pull

# 4. Create a new migration
supabase migration new add_topics_table

# 5. Edit the migration file in supabase/migrations/
# 6. Test locally (optional - requires Docker)
supabase db reset  # Resets local DB and runs all migrations

# 7. Push to production when ready
supabase db push
```

**Migration files live in your repo:**

```
supabase/
  migrations/
    20251124_create_profiles.sql
    20251124_create_items.sql
    20251130_add_api_key.sql
    20251130_enable_realtime.sql
```

**Option B: Supabase Branching (Easiest for Solo/Small Team)**

Supabase has built-in branching that creates isolated database copies:

```bash
# Create a branch (creates new DB with your schema)
supabase branches create feature/topics

# Work on your feature, make schema changes
# When ready, merge migrations to main
supabase branches merge feature/topics

# Branch DB is deleted, migrations applied to production
```

Cost: Branches are billed hourly (check Supabase pricing).

**Option C: Two Separate Projects (Current Setup)**

Simpler but requires manual sync:

1. **Dev project**: Experiment freely, break things
2. **Production project**: Only apply tested migrations

**Sync workflow:**

```bash
# After testing a migration on dev:
# 1. Save the SQL that worked
# 2. Apply to production via Supabase dashboard or CLI
supabase db push --project-ref sqyarjblpozowlqluasg
```

---

### Safe Migration Practices

**Before deploying any migration:**

1. **Test on dev first** - Never experiment on production
2. **Make migrations reversible** when possible:

   ```sql
   -- Migration: add column
   ALTER TABLE items ADD COLUMN reading_time integer;

   -- Rollback (save this!)
   ALTER TABLE items DROP COLUMN reading_time;
   ```

3. **Avoid destructive changes** in production:

   - ❌ `DROP TABLE` - loses data
   - ❌ `DROP COLUMN` - loses data
   - ✅ `ADD COLUMN` - safe
   - ✅ `CREATE TABLE` - safe
   - ⚠️ `ALTER COLUMN` - test carefully

4. **For breaking changes**, do it in steps:
   ```
   Deploy 1: Add new column (both old and new code works)
   Deploy 2: Update code to use new column
   Deploy 3: Remove old column (after confirming no issues)
   ```

---

### Quick Reference: Migration Commands

```bash
# Supabase CLI (recommended)
supabase migration new <name>     # Create new migration file
supabase db push                  # Apply migrations to linked project
supabase db pull                  # Pull remote schema to local
supabase db reset                 # Reset local DB (requires Docker)
supabase db diff                  # Show schema differences

# Check migration status
supabase migration list
```

---

### Setting Up Local Supabase (Recommended)

**Prerequisites:** Docker Desktop must be running.

```bash
# 1. Start local Supabase (first time takes a few minutes)
cd /Users/fernando/Code/bookmarks
supabase start

# 2. Note the output - it shows your local credentials:
#    API URL: http://127.0.0.1:54321
#    anon key: eyJ...
#    service_role key: eyJ...

# 3. Copy env.example to .env.local and update with local credentials
cp env.example .env.local
# Edit .env.local with the values from step 2

# 4. Run migrations on local database
supabase db reset  # This runs all migrations fresh

# 5. Start the app
pnpm dev
```

**Local Supabase Commands:**

```bash
supabase start      # Start local Supabase (Docker)
supabase stop       # Stop local Supabase
supabase db reset   # Reset DB and run all migrations
supabase status     # Show local URLs and keys
supabase studio     # Open local Supabase Studio (GUI)
```

**Local URLs:**

- App: http://localhost:3000
- Supabase Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321

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

| Environment            | Database      | Purpose           |
| ---------------------- | ------------- | ----------------- |
| `pnpm dev`             | Dev Supabase  | Experiment freely |
| Vercel                 | Prod Supabase | Real bookmarks    |
| Extension (localhost)  | Dev Supabase  | Test extension    |
| Extension (vercel URL) | Prod Supabase | Real use          |
| PWA                    | Prod Supabase | Real use          |

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
