# FitTrack Routine Dashboard — Agent Guide

Read this file at the start of substantial work on this repository.

## What this project is

**FitTrack Routine Dashboard** is a mobile-first fitness web app (Next.js 16 App Router, React 19, TypeScript, Tailwind 4, shadcn/ui). It tracks workout **routines by day**, **exercises**, and **sets**. Progress is measured in **completed sets**, not reps.

**Repository:** https://github.com/barbimt/fittrack-routine-dashboard

## Current phase

| In scope | Out of scope / later |
|----------|----------------------|
| UI, layout, accessibility | `localStorage` unless user asks |
| Supabase auth, routines, sessions on `/` | Multi-tenant admin |
| Excel import + save to Supabase | `/progress` and `/week` with real session data |
| Routine editor CRUD on `/editor` (Supabase) | — |
| Supabase local (Docker) for dev | — |

Do **not** use `any`. Match existing patterns. Keep diffs small. Update `README.md` and nested `AGENTS.md` when behavior changes; `docs/` when detailed specs exist (see `docs/README.md`).

## Commands

```bash
pnpm install       # dependencies
pnpm dev           # http://localhost:3000
pnpm build         # production build — run before finishing larger changes
pnpm lint          # ESLint
pnpm lint:fix      # ESLint with auto-fix
pnpm format        # Prettier write
pnpm format:check  # Prettier check (CI)
pnpm check         # lint + format:check + typecheck (local CI gate)
pnpm typecheck     # tsc --noEmit
pnpm test          # Vitest watch
pnpm test:run      # Vitest single run (CI)
pnpm test:coverage # Vitest with coverage
pnpm supabase:start  # local Supabase (Docker)
pnpm supabase:stop
pnpm supabase:status
pnpm supabase:reset  # re-apply migrations
```

### Git hooks (Husky)

After `pnpm install`, hooks run automatically:

| Hook | Runs |
|------|------|
| `pre-commit` | `lint-staged` — ESLint + Prettier on staged files |
| `pre-push` | `pnpm lint && pnpm format:check` |

Agents must **not** use `git commit --no-verify` / skip hooks unless the user explicitly asks. Before committing, if hooks are unavailable, run `pnpm format` and `pnpm lint:fix`, then re-stage.

## Key paths

Nested **`AGENTS.md`** files auto-apply when Cursor works in that folder ([docs](https://cursor.com/docs/rules#nested-agentsmd-support)). Prefer updating them over inline code comments.

| Path | Purpose |
|------|---------|
| `app/AGENTS.md` | Routes and page patterns |
| `components/fitness/AGENTS.md` | Workout components + behavior notes |
| `features/AGENTS.md` | Auth, import, routines modules |
| `lib/AGENTS.md` | Utils, mock types, Supabase clients |
| `docs/` | Architecture, domain, import, roadmap (in repo) |
| `.cursor/rules/` | Glob-scoped rules (local only, gitignored) |
| `.cursor/skills/` | Workflows on demand (local only, gitignored) |
| `app/` | Routes (one `page.tsx` per screen) |
| `components/fitness/` | Workout UI components |
| `components/layout/` | Sidebar, Header (mobile hamburger drawer) |
| `components/app-shell.tsx` | Shell; optional `aside` on `xl+` |
| `components/ui/` | shadcn primitives |
| `features/routine-import/` | Excel import types, parser, preview UI |
| `lib/mock-data.ts` | Dashboard types + mock `trainingDays` |
| `lib/design-tokens.ts` | Palette (OKLCH) |
| `app/globals.css` | CSS variables + Tailwind theme |
| `supabase/` | Schema, migrations, README, reset SQL |

## Routes

- `/` — Today's workout (Supabase routine + sessions)
- `/login`, `/signup` — Auth
- `/upload` — Excel import: parse, preview, save routine
- `/editor` — Routine editor (persists to Supabase)
- `/empty` — No routine empty state
- `/demo` — Public mock dashboard (`/preview` redirects here)
- `/week` — Weekly overview (mock)
- `/progress` — Analytics (mock)
- `/settings` — Settings placeholder (not persisted)

## Domain rules

- **Set completed** = checkbox checked (progress counts sets, not reps).
- **Daily progress** = `completedSets / totalSets` for selected day.
- Mock Monday sample in `lib/mock-data.ts` is for prototypes/tests only; `/` uses DB data.
- **Import:** saved via `saveRoutine`; see `docs/ROUTINE-IMPORT.md` and `features/AGENTS.md`.

Dashboard types: `lib/mock-data.ts` — `TrainingDay`, `Exercise`, `ExerciseSet`.  
Import types: `features/routine-import/types.ts` — `ParsedRoutine`, etc.

## Design

Calm, minimal. Warm stone, sage accent. Mobile-first; sidebar + optional right panel on `xl+`.

Use `components/fitness/` (`Button`, `Input`, `Badge`) for app chrome; `components/ui/` for shadcn primitives.

## Skills (`.cursor/skills/` — local only)

| Skill | When |
|-------|------|
| `fittrack-domain` | Types, mock data, progress calculations |
| `fittrack-ui` | New screens, fitness components, tokens |
| `fittrack-workout-state` | Checkboxes, reps, day selection, reset |
| `fittrack-excel-import` | Upload page, parser, preview, template |
| `fittrack-pre-commit-ci` | Before commit/PR: format, lint, CI gates |

## Suggested implementation order

1. ~~Workout state + Supabase sessions on `/`~~ (done)
2. ~~Import → Supabase~~ (done)
3. ~~Editor CRUD on `/editor`~~ (done)
4. `/progress` and `/week` from real `workout_sessions` / set logs
5. History / analytics polish

See `docs/ROADMAP.md` for checklists.

## Commits & Git

- Commit only when the user asks.
- Never skip Husky with `--no-verify` unless the user explicitly asks.
- Remote: `origin` → `github.com:barbimt/fittrack-routine-dashboard.git`, branch `main`.
