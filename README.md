# Portable

A little pocket for the internet things you love. Save, watch, and read later.

## Features

- **Everything** — All your saved links in one place
- **Later** — Items you want to watch/read later
- **Favorites** — Your starred, most-loved content
- **Browser Extension** — Save links with one click (Cmd+Shift+S)
- **PWA** — Install on mobile, share links directly from any app
- **Real-time Sync** — Items appear instantly across devices

## Quick Start

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — Required for local Supabase
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `brew install supabase/tap/supabase`

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Start Docker Desktop (required for Supabase)
open -a Docker

# 3. Start local Supabase
supabase start

# 4. Get your local credentials
supabase status

# 5. Create .env.local with local Supabase credentials
cp env.example .env.local
# Then edit .env.local (see "Local Supabase Setup" section below)

# 6. Run migrations (first time only - creates tables)
supabase db reset

# 7. Start the app
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) to see the app.

> **Note:** Use `127.0.0.1` instead of `localhost` to avoid IPv6 issues.

## Local Supabase Setup

### Starting Supabase

```bash
# Start all Supabase services (requires Docker)
supabase start

# View running services and credentials
supabase status

# Stop Supabase (keeps data)
supabase stop

# Stop and reset all data
supabase stop --no-backup
```

### Getting Credentials

After running `supabase start`, run `supabase status -o env` to see credentials:

```
API_URL="http://127.0.0.1:54321"
ANON_KEY="eyJhbGci..."
SERVICE_ROLE_KEY="eyJhbGci..."
```

Copy these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  # ANON_KEY from status
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...       # SERVICE_ROLE_KEY from status
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

### Local Services

| Service  | URL                                                     | Purpose                                |
| -------- | ------------------------------------------------------- | -------------------------------------- |
| API      | http://127.0.0.1:54321                                  | Supabase API (auth, database, storage) |
| Studio   | http://127.0.0.1:54323                                  | Database GUI (like pgAdmin)            |
| Mailpit  | http://127.0.0.1:54324                                  | Catches auth emails locally            |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct Postgres connection             |

### Database Commands

```bash
# Apply pending migrations (preserves data) — USE THIS MOST OF THE TIME
supabase migration up

# View migration status
supabase migration list

# Create a new migration
supabase migration new my_new_feature

# Reset database (DESTROYS ALL DATA) — only for fresh start or testing seed data
supabase db reset

# Push migrations to remote (production)
supabase db push
```

#### When to Use Each Command

| Command | Use When | Data Preserved? |
|---------|----------|-----------------|
| `migration up` | Applying new migrations during development | ✅ Yes |
| `migration list` | Checking which migrations have been applied | — |
| `migration new` | Creating a new schema change | — |
| `db reset` | Starting fresh, testing seeds, or after editing old migrations | ❌ No |
| `db push` | Deploying to production | ✅ Yes |

### Troubleshooting

**"Cannot connect to Docker daemon"**

- Open Docker Desktop and wait for it to start

**"Port already in use"**

- Stop other Supabase instances: `supabase stop`
- Or kill the process: `lsof -ti:54321 | xargs kill`

**"Migration failed"**

- Check migration SQL for errors
- If the migration was already partially applied, you may need to reset: `supabase db reset`
- For new migrations, fix the SQL and run `supabase migration up` again

## Browser Extension

```bash
cd extension
pnpm install
pnpm dev        # Development mode (Chrome)
pnpm build      # Production build
```

Load the extension in Chrome:

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/.output/chrome-mv3/`

Configure the extension:

- **Server URL:** `http://127.0.0.1:3000` (local) or your Vercel URL (production)
- **API Key:** Get from user menu → API Key in the webapp

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Database:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Realtime)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Extension:** [WXT](https://wxt.dev) (cross-browser extension framework)
- **PWA:** [Serwist](https://serwist.pages.dev) (service worker)

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Login/signup pages
│   │   ├── (protected)/     # Authenticated pages
│   │   └── api/             # API routes
│   ├── components/          # React components
│   └── lib/                 # Utilities, actions, Supabase clients
├── extension/               # Browser extension (WXT)
├── supabase/
│   ├── migrations/          # Database migrations
│   └── config.toml          # Local Supabase config
├── public/                  # Static assets, PWA manifest
└── .agents/                 # Project documentation
```

## Environment Variables

| Variable                        | Description                  | Local Value              |
| ------------------------------- | ---------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase API URL             | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key            | From `supabase status`   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key    | From `supabase status`   |
| `NEXT_PUBLIC_SITE_URL`          | App URL (for auth redirects) | `http://127.0.0.1:3000`  |

## Documentation

- [Production Checklist](.agents/docs/production-checklist.md) — Deployment guide
- [Decisions Log](.agents/decisions.md) — Architecture decisions
- [Current Focus](.agents/current-focus.md) — What we're working on

## License

Private — Not open source (yet)
