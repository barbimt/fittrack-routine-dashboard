# FitTrack Routine Dashboard — Agent Guide

Read this file at the start of substantial work on this repository.

## What this project is

**FitTrack Routine Dashboard** is a premium, mobile-first fitness web app **UI prototype** (Next.js 16 App Router, React 19, TypeScript, Tailwind 4, shadcn/ui). It tracks workout **routines by day**, **exercises**, and **sets**. Progress is measured in **completed sets**, not reps.

**Repository:** https://github.com/barbimt/fittrack-routine-dashboard

## Current phase (important)

| In scope now | Out of scope until explicitly requested |
|--------------|----------------------------------------|
| UI, layout, accessibility | Backend, API, database |
| React client state | Auth, multi-user |
| Replacing mocks with real logic | Real Excel parsing (unless asked) |
| `localStorage` / persistence when asked | `localStorage` by default |
| Chart libraries when asked | Heavy deps without need |

Do **not** use `any`. Match existing patterns. Keep diffs small.

## Commands

```bash
pnpm install    # dependencies
pnpm dev        # http://localhost:3000
pnpm build      # production build — run before finishing larger changes
pnpm lint       # ESLint
```

## Key paths

| Path | Purpose |
|------|---------|
| `app/` | Routes (one `page.tsx` per screen) |
| `components/fitness/` | Reusable workout UI — prefer extending these |
| `components/layout/` | Sidebar, Header, MobileNavigation |
| `components/app-shell.tsx` | Shell; pass `aside` for desktop summary column |
| `components/ui/` | shadcn primitives — do not duplicate |
| `lib/mock-data.ts` | Types + mock `trainingDays` + helpers |
| `lib/design-tokens.ts` | Palette reference (OKLCH) |
| `app/globals.css` | CSS variables + Tailwind theme |
| `docs/` | Architecture, domain, roadmap |

## Routes

- `/` — Today's workout dashboard
- `/upload` — Excel upload mock
- `/week` — Weekly overview
- `/progress` — Analytics mock
- `/editor` — Routine editor mock
- `/empty` — No routine empty state
- `/settings` — Settings placeholder

## Domain rules

- **Set completed** = checkbox checked (progress counts sets, not reps).
- **Daily progress** = `completedSets / totalSets` for selected day.
- Mock Monday example: **4 of 13 sets** (Hip Thrust 2/4 done, RDL 2/3, etc.).

Types live in `lib/mock-data.ts`: `TrainingDay`, `Exercise`, `ExerciseSet`.

## Design

Calm, minimal, premium (Apple Fitness / Whoop / Linear). Warm stone background, sage accent, soft semantic colors. No neon gym aesthetic. Mobile-first; sidebar + optional right panel on `xl+`.

Use fitness wrappers in `components/fitness/` (`Button`, `Input`, `Badge`) for app chrome; shadcn under `components/ui/` for primitives.

## Project skills (`.cursor/skills/`)

Use when the task matches:

| Skill | When |
|-------|------|
| `fittrack-domain` | Types, mock data, progress calculations |
| `fittrack-ui` | New screens, components, design tokens |
| `fittrack-workout-state` | Checkboxes, reps, day selection, reset |
| `fittrack-excel-import` | Upload page, `.xlsx` import planning |

## Suggested implementation order

1. Workout state on `/` (toggle sets, edit reps, reset day/exercise)
2. Routine persistence (`localStorage` or API — user decides)
3. Excel import on `/upload`
4. Editor CRUD on `/editor`
5. Charts on `/progress`
6. Empty state routing when no routine

See `docs/ROADMAP.md` for detail.

## Commits & Git

- Commit only when the user asks.
- Remote: `origin` → `github.com:barbimt/fittrack-routine-dashboard.git`, branch `main`.
