# FitTrack Routine Dashboard

Premium, mobile-first web app for following a weekly strength routine. Progress is tracked by **completed sets** (not reps).

**Live demo:** [fittrack-routine-dashboard.vercel.app](https://fittrack-routine-dashboard.vercel.app)

## Overview

FitTrack lets authenticated users import or edit a weekly workout routine, log sets during training sessions, and track daily progress. Each user has isolated data via Supabase Row Level Security.

## Features

| Area | Description |
|------|-------------|
| Today's workout (`/`) | Active routine from Supabase; day selection; set checkboxes and rep logging; save / edit / reset session |
| Onboarding (`/`) | When there is no active routine, the dashboard shows import / create-from-scratch CTAs |
| Excel import (`/upload`) | Client-side `.xlsx` parse; one sheet per training day; save redirects to the dashboard |
| Routine editor (`/editor`) | Create a routine from scratch or edit the active one; persists to Supabase |
| Auth | Email/password signup (lands on `/`), Google OAuth, login; protected routes via middleware |
| Weekly overview (`/week`), analytics (`/progress`) | UI prototypes with mock data (not wired to sessions yet) |

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Radix UI / shadcn
- Supabase (Auth, Postgres, RLS)
- [SheetJS `xlsx`](https://sheetjs.com/) for Excel import

## Project structure

| Path | Role |
|------|------|
| `app/` | Routes and pages |
| `components/fitness/` | Workout UI (dashboard, sets, editor) |
| `components/layout/` | Navigation and shell |
| `features/auth/` | Login, signup, Google OAuth, logout |
| `features/routine-import/` | Excel parser, preview, save routine |
| `features/routines/` | Session actions, editor types, create/update routine, DB mapper |
| `lib/mock-data.ts` | UI types (`TrainingDay`, etc.) and week/progress helpers |
| `supabase/` | Schema, migrations, reset SQL |

## Database

- Schema: `supabase/schema.sql` and `supabase/migrations/`
- Tables: `profiles`, `routines`, `routine_days`, `routine_exercises`, `workout_sessions`, `workout_set_logs`
- One active routine per user; RLS on all tables

## Development

Requires Node.js 20+, pnpm, and Docker (for local Supabase). Copy `supabase/env.local.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `pnpm supabase:status -o env`.

```bash
pnpm install
pnpm supabase:start && pnpm supabase:reset
pnpm dev
```

### Local checklist (onboarding)

1. Sign up with email → should land on `/` with the empty dashboard if you have no routine.
2. Optional Google: set `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `SECRET` (see `supabase/README.md`), restart Supabase, use **Continue with Google**.
3. From `/`, **Create from scratch** → `/editor` → add day + exercise → save → open `/`.
4. Or **Import routine** → save Excel → redirects to `/`.

```bash
pnpm build     # production build
pnpm test:run  # unit tests
pnpm lint      # ESLint
```

## Design

Calm, minimal UI: warm stone background, sage accent, mobile-first layout with a fixed sidebar on desktop and a hamburger drawer on mobile.
