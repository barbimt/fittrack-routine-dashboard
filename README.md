# FitTrack Routine Dashboard

Premium, mobile-first web app for following a weekly strength routine. Track progress by **completed sets** (not reps). Built with Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, and **Supabase**.

**Repository:** [github.com/barbimt/fittrack-routine-dashboard](https://github.com/barbimt/fittrack-routine-dashboard)

**Production:** [fittrack-routine-dashboard.vercel.app](https://fittrack-routine-dashboard.vercel.app)

## Features

### Today’s workout (`/`)

- Requires login; loads the user’s **active routine** from Supabase
- Select training day; daily progress (completed sets / total sets)
- Exercise cards: checkboxes, target reps, actual reps (saved to `workout_set_logs`)
- Reset exercise / reset day; **Save workout** (partial or full day)
- Read-only mode after save with **Edit workout** or **Reset day**
- Weekly summary panel on large screens

### Excel import (`/upload`)

- Upload `.xlsx` (client-side parse)
- **One sheet = one training day** — columns: `EXERCISE`, `SETS x REPS`; optional `WEIGHT`, `NOTES`
- Preview + validation; **save to Supabase** as the active routine
- Download sample template (`fittrack-routine-template.xlsx`)

### Routine editor (`/editor`)

- Edit the active routine from Supabase: days, exercises, prescriptions, muscle groups
- Saves changes back to the database

### Auth

- Email/password signup and login (`/signup`, `/login`)
- After signup → redirect to `/login` with a success notice (no auto-login)
- Password fields: show/hide toggle and placeholder clears on focus
- Protected routes via middleware

### Other routes

- `/week`, `/progress` — UI prototypes with mock data (not wired to sessions yet)
- `/empty` — no active routine
- `/settings` — placeholder

## Clone and run locally

Anyone can clone this repo, run Supabase locally with Docker, sign up, and use the app with their own isolated data. Each user only sees their own routines and sessions (Row Level Security).

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (`corepack enable && corepack prepare pnpm@latest --activate`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — running
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `brew install supabase/tap/supabase`

### 1. Clone and install

```bash
git clone https://github.com/barbimt/fittrack-routine-dashboard.git
cd fittrack-routine-dashboard
pnpm install
```

### 2. Start local Supabase

First run downloads Docker images (~2–5 min).

```bash
pnpm supabase:start
pnpm supabase:reset    # apply schema + migrations
```

### 3. Environment variables

Create `.env.local` in the project root (template: `supabase/env.local.example`):

```bash
pnpm supabase:status -o env | grep ANON_KEY
```

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from the command above>
```

Use the **JWT `ANON_KEY`**, not the `Publishable` key from the visual `supabase status` table.

### 4. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Create an account and train

1. Go to **Sign up** (`/signup`) — any email and password (min. 6 characters), e.g. `test@local.dev` / `123456`.
2. You are redirected to `/login` with “Cuenta creada con éxito” — sign in with the same credentials.
3. Import a routine on `/upload` or edit on `/editor`.
4. Train on `/`.

Local auth does **not** send real emails (`enable_confirmations = false` in `supabase/config.toml`).

### Local URLs

| Service | URL |
| -------- | ----- |
| App | http://localhost:3000 |
| Supabase Studio (tables, users, SQL) | http://127.0.0.1:54323 |
| API | http://127.0.0.1:54321 |

### Day-to-day

```bash
pnpm supabase:start   # if Docker was stopped
pnpm dev
```

```bash
pnpm supabase:stop    # stop containers
pnpm supabase:status  # URLs and keys
```

### Reset local data

```bash
pnpm supabase:reset
```

Wipes all users and data; you must sign up again. To clear only workout sessions (keep routines): run `supabase/reset-workout-sessions.sql` in Studio.

Full local guide: **[supabase/LOCAL-DEV.md](supabase/LOCAL-DEV.md)**

## Supabase cloud (optional)

To point the app at a hosted project instead of Docker:

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL Editor (or link the CLI and push migrations).
3. Set URL + anon key in `.env.local` and restart `pnpm dev`.
4. In Authentication → Providers → Email, disable **Confirm email** if you want instant signup without SMTP (same flow as local).

Switch between local and cloud by editing `.env.local` (keep a backup in `.env.cloud.local`, gitignored).

## Production deployment (Vercel)

The app is deployed on Vercel connected to Supabase cloud:

| Setting | Value |
| -------- | ----- |
| Site | https://fittrack-routine-dashboard.vercel.app |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (JWT) key |

In Supabase → Authentication → URL Configuration:

- **Site URL** = your Vercel domain
- **Redirect URLs** = `https://<your-domain>/auth/callback`

## Scripts

| Command | Description |
| -------- | ------------- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm test:run` | Vitest (CI) |
| `pnpm supabase:start` | Start local Supabase (Docker) |
| `pnpm supabase:stop` | Stop local Supabase |
| `pnpm supabase:status` | Local URLs and keys |
| `pnpm supabase:reset` | Reset local DB + re-apply migrations |

## Project structure

| Path | Role |
| ------ | ------ |
| `app/` | Routes and pages |
| `components/fitness/` | Workout UI (`DashboardClient`, cards, sets, editor) |
| `components/layout/` | Navigation and shell |
| `features/auth/` | Login, signup, logout, `PasswordInput` |
| `features/routine-import/` | Excel parser, preview, save routine |
| `features/routines/` | Session actions, editor types, DB mapper |
| `lib/mock-data.ts` | UI types (`TrainingDay`, etc.) + week/progress helpers |
| `supabase/` | Schema, migrations, local dev docs, reset SQL |

## Database

- Schema: `supabase/schema.sql` (also applied via `supabase/migrations/`)
- **Local:** Studio at http://127.0.0.1:54323 after `pnpm supabase:start`
- **Per-user isolation:** RLS on all tables; `handle_new_user` trigger creates a `profiles` row on signup
- **Reset test progress:** `supabase/reset-workout-sessions.sql`
- **Reset one user’s data:** `supabase/reset-user-data.sql`

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Radix UI / shadcn
- Supabase (Auth, Postgres, RLS)
- [SheetJS `xlsx`](https://sheetjs.com/) for Excel

## Design

Calm, minimal UI: warm stone background, sage accent, touch-friendly controls. Responsive shell with sidebar on desktop and bottom tabs on mobile.
