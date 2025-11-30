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
- [pnpm](https://pnpm.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`)

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Start local Supabase (requires Docker)
supabase start

# 3. Set up environment variables
cp env.example .env.local
# Edit .env.local with credentials shown by `supabase start`

# 4. Run migrations
supabase db reset

# 5. Start the app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Browser Extension

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

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
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

## Database Migrations

All schema changes are tracked as SQL migration files:

```bash
# Create a new migration
supabase migration new add_new_feature

# Apply migrations to local DB
supabase db reset

# Push to production (after testing locally)
supabase db push
```

## Environment Variables

| Variable                        | Description                  | Where               |
| ------------------------------- | ---------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase API URL             | .env.local / Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key            | .env.local / Vercel |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key    | .env.local / Vercel |
| `NEXT_PUBLIC_SITE_URL`          | App URL (for auth redirects) | .env.local / Vercel |

## Documentation

- [Production Checklist](.agents/docs/production-checklist.md) — Deployment guide
- [Decisions Log](.agents/decisions.md) — Architecture decisions
- [Current Focus](.agents/current-focus.md) — What we're working on

## License

Private — Not open source (yet)
