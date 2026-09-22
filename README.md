# FitTrack

Personal project: a **mobile-first workout dashboard** for tracking a weekly routine. Progress is **completed sets**, not reps.

Built to practice a full product slice — UI, domain model, auth, Postgres with RLS, Excel import, and a real CRUD editor — not just a static landing page.

[Live app](https://fittrack-routine-dashboard.vercel.app) · [Public demo (no account)](https://fittrack-routine-dashboard.vercel.app/demo) · [Repo](https://github.com/barbimt/fittrack-routine-dashboard)

---

## Why this exists

I wanted a tracker that matches how I actually train: a **named day**, a list of **exercises**, and **sets** I check off. Spreadsheets are fine for writing a plan; they are poor for logging a session on a phone.

FitTrack is the app I would use between Excel (coach / self-written routine) and the gym floor.

## What you can do

| Flow | What it shows |
|------|----------------|
| **Today’s workout** (`/`) | Load the active routine, log sets and actual reps, reset a day. Auth required. |
| **Import from Excel** (`/upload`) | Parse `.xlsx` in the browser, preview warnings, save to Supabase. |
| **Routine editor** (`/editor`) | Add / rename / remove days and exercises, drag-and-drop reorder, save only the diff. |
| **Public demo** (`/demo`) | Same dashboard UI with mock data — no login. |

Week overview and progress charts exist as gated UI (`/week`, `/progress`); they still use mock data. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| App | **Next.js 16** (App Router) + **React 19** | Server Components for data load, Server Actions for mutations, `proxy.ts` for auth redirects |
| Language | **TypeScript** (strict, no `any`) | Shared domain types from dashboard → import → DB mapper |
| UI | **Tailwind CSS 4**, **shadcn/ui** / Radix, **lucide-react** | Calm stone + sage theme; mobile-first shell (sidebar / hamburger) |
| Backend | **Supabase** (Auth, Postgres, **RLS**) | Local Docker for development; hosted project for the Vercel deploy |
| Import | **SheetJS (`xlsx`)** | Client-side parse so the file never hits a custom upload API |
| Editor | **Zod** + **`@dnd-kit`** | Validate before save; sortable days/exercises with stable DnD ids for SSR |
| Tests / quality | **Vitest**, ESLint, Prettier, Husky | `pnpm check` / `pnpm test:run` / `pnpm build` before non-trivial changes |

Package manager: **pnpm**. Deploy: **Vercel**.

## How it is structured

```
app/                      routes (one page.tsx per screen)
components/fitness/       workout UI (props in, events up)
components/layout/        sidebar, header, mobile drawer
features/auth/            login, signup, logout (Server Actions)
features/routine-import/  Excel parser + preview (parser is React-free)
features/routines/        DB types, mapper, editor patch, session actions
lib/mock-data.ts          TrainingDay / Exercise / ExerciseSet + progress helpers
lib/supabase/             browser, server, and middleware clients
lib/features/             product flags (catalog + env overrides)
supabase/                 schema, migrations, local stack
docs/                     architecture, domain, import, roadmap
```

**Data flow (dashboard):** Server Component loads the user + active routine from Postgres → maps rows to `TrainingDay[]` → `DashboardClient` + `useWorkoutSession`. Checkboxes and rep edits go through Server Actions (`toggleSetLog`, `updateSetReps`).

**Editor saves:** draft vs baseline (`useDirtyState`) → Zod (`validateRoutineDays`) → `computeRoutinePatch` → `updateRoutine` writes only changed rows.

Deeper diagrams: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Domain rules: [docs/DOMAIN.md](docs/DOMAIN.md).

## Decisions worth a look

These are the parts I would walk through in an interview:

1. **Progress = completed sets** — a single, explicit domain rule; reps are logged but do not drive the %.
2. **Server Components + Server Actions** — no client-side Supabase writes for session/editor; cookies and RLS stay on the server path.
3. **RLS on every table** — users only see their own routines and session logs.
4. **Excel as a first-class input** — parse, warn, preview, then persist; template download for the expected columns.
5. **Diff-based editor persistence** — avoid rewriting the whole tree on every save.
6. **Feature catalog** — incomplete screens stay behind `NEXT_PUBLIC_FEATURE_*` instead of shipping dead nav.

Honest limits: `/week` and `/progress` are not wired to `workout_sessions` yet; settings are a placeholder.

## Local setup

Needs **Node 20+**, **pnpm**, and **Docker** (local Supabase).

```bash
pnpm install
cp .env.example .env.local
pnpm supabase:start && pnpm supabase:reset
```

Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `pnpm supabase:status -o env` into `.env.local`, then:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up locally (email confirmation is typically auto-confirmed on the local stack). More detail: [supabase/README.md](supabase/README.md).

### Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` / `pnpm format:check` | ESLint + Prettier (also run on git hooks) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test:run` | Vitest once |
| `pnpm supabase:start` / `reset` / `status` | Local database and Auth |

## Docs

| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, layering, dashboard / import / editor / auth flows |
| [docs/DOMAIN.md](docs/DOMAIN.md) | Entities and progress math |
| [docs/ROUTINE-IMPORT.md](docs/ROUTINE-IMPORT.md) | Excel format and save path |
| [docs/FEATURES.md](docs/FEATURES.md) | Feature flags |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Done vs next |
