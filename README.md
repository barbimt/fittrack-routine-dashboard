# FitTrack Routine Dashboard

Mobile-first web app for following a weekly strength routine. Progress is tracked by **completed sets** (not reps).

**Live demo:** [fittrack-routine-dashboard.vercel.app](https://fittrack-routine-dashboard.vercel.app)

## Overview

FitTrack lets signed-in users import or edit a weekly workout routine, log sets during training sessions, and track daily progress. Each user has isolated data via Supabase Row Level Security.

## Features

| Area | Description |
|------|-------------|
| Today's workout (`/`) | Active routine from Supabase; day selection; set checkboxes and rep logging; session save / reset |
| Excel import (`/upload`) | Client-side `.xlsx` parse; one sheet per training day; save as the active routine |
| Routine editor (`/editor`) | Edit days, exercises, and prescriptions; persists to Supabase |
| Auth (`/login`, `/signup`) | Email/password signup and login; protected routes via middleware |
| Demo (`/demo`) | Public sample dashboard from mock data (no database) |
| Weekly overview (`/week`), analytics (`/progress`), settings (`/settings`) | UI with mock or non-persisted data (not wired to sessions yet) |

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
| `features/auth/` | Login, signup, logout |
| `features/routine-import/` | Excel parser, preview, save routine |
| `features/routines/` | Session actions, editor types, DB mapper |
| `lib/mock-data.ts` | UI types (`TrainingDay`, etc.) and week/progress helpers |
| `supabase/` | Schema, migrations, reset SQL |
| `docs/` | Architecture, domain, import, and roadmap |

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

```bash
pnpm build     # production build
pnpm test:run  # unit tests
pnpm lint      # ESLint
```

See [`docs/`](docs/README.md) for architecture and contributor notes. Local Supabase layout: [`supabase/README.md`](supabase/README.md).

## Design

Calm, minimal UI: warm stone background, sage accent, mobile-first layout with a fixed sidebar on desktop and a hamburger drawer on mobile.
