# FitTrack Routine Dashboard

Premium, mobile-first web app for following a weekly strength routine. Track progress by **completed sets** (not reps). Built with Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, and **Supabase**.

**Repository:** [github.com/barbimt/fittrack-routine-dashboard](https://github.com/barbimt/fittrack-routine-dashboard)

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

### Auth

- Email/password signup and login (`/signup`, `/login`)
- Protected routes via middleware

### Other routes (prototypes)

- `/week`, `/progress`, `/editor` — UI with mock data (not wired to sessions yet)
- `/empty` — no active routine
- `/settings` — placeholder

## Quick start

### 1. Install

```bash
pnpm install
```

### 2. Environment

**Option A — Supabase local (recommended for testing, $0, no cloud data):**

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) and Supabase CLI (`brew install supabase/tap/supabase`).

```bash
pnpm supabase:start    # first time: downloads images
pnpm supabase:reset    # apply schema
```

Create `.env.local` in the project root (see `supabase/env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<run: pnpm supabase:status -o env | grep ANON_KEY>
```

Use the **JWT `ANON_KEY`**, not the `Publishable` key from the visual summary.

Full guide: **[supabase/LOCAL-DEV.md](supabase/LOCAL-DEV.md)**

**Option B — Supabase cloud:** create a project at [supabase.com](https://supabase.com), run `supabase/schema.sql` in the SQL Editor, set URL + anon key in `.env.local`.

### 3. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → sign up → import a routine on `/upload` → train on `/`.

## Scripts

| Command | Description |
| -------- | ------------- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint |
| `pnpm test:run` | Vitest (CI) |
| `pnpm supabase:start` | Start local Supabase (Docker) |
| `pnpm supabase:stop` | Stop local Supabase |
| `pnpm supabase:status` | Local URLs and keys |
| `pnpm supabase:reset` | Reset local DB + re-apply migrations |

## Project structure

| Path | Role |
| ------ | ------ |
| `app/` | Routes and pages |
| `components/fitness/` | Workout UI (`DashboardClient`, cards, sets) |
| `components/layout/` | Navigation and shell |
| `features/auth/` | Login, signup, logout |
| `features/routine-import/` | Excel parser, preview, save routine |
| `features/routines/` | Session actions, DB mapper |
| `lib/mock-data.ts` | UI types (`TrainingDay`, etc.) + week/progress helpers |
| `supabase/` | Schema, migrations, local dev docs, reset SQL |

## Database

- Schema: `supabase/schema.sql` (also applied via `supabase/migrations/`)
- **Local:** Studio at http://127.0.0.1:54323 after `pnpm supabase:start`
- **Reset test progress (cloud or local):** `supabase/reset-workout-sessions.sql`
- **Reset one user’s routines (cloud):** `supabase/reset-user-data.sql`

Switch between local and cloud by editing `.env.local` (keep a backup in `.env.cloud.local`).

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Radix UI / shadcn
- Supabase (Auth, Postgres, RLS)
- [SheetJS `xlsx`](https://sheetjs.com/) for Excel

## Design

Calm, minimal UI: warm stone background, sage accent, touch-friendly controls. Responsive shell with sidebar on desktop and bottom tabs on mobile.
