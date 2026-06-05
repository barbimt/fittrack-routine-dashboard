# FitTrack Routine Dashboard

Premium, mobile-first web app for following a weekly strength routine. Track progress by **completed sets** (not reps). Built with Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui.

**Repository:** [github.com/barbimt/fittrack-routine-dashboard](https://github.com/barbimt/fittrack-routine-dashboard)

## Features

### Today’s workout (`/`)

- Select training day (Mon–Fri sample routine)
- Daily progress: completed sets vs total sets
- Exercise cards with per-set checkboxes, target reps, and actual reps inputs
- Weekly summary panel on large screens
- Mobile layout with bottom navigation

### Excel import (`/upload`)

- Upload a `.xlsx` routine file (client-side, no server required)
- **One sheet = one training day** (e.g. `Day 1 - FULL BODY`)
- Required columns: `EXERCISE`, `SETS x REPS` — optional: `WEIGHT`, `NOTES`
- Validates headers and rows; shows clear errors and non-blocking warnings
- **Routine preview**: day count, exercise count, sample exercises per day
- Expandable list for additional exercises per day (“Show N more exercises”)
- **Download template** — sample workbook (`fittrack-routine-template.xlsx`)
- Import button reserved for a future save step (database not wired yet)

Prescription parsing supports formats like `4x10`, `3 x 12`, `3x10 per leg`, and `1x12 - 3x12` (including Excel’s `×` character).

### Week overview (`/week`)

- Weekly calendar-style view of the sample routine

### Progress (`/progress`)

- Analytics UI prototype (sample charts and stats)

### Routine editor (`/editor`)

- Editor UI prototype for managing days and exercises

### Empty state (`/empty`)

- Onboarding screen when no routine is loaded

### Settings (`/settings`)

- Settings placeholder

## Design

Calm, minimal UI: warm stone background, sage accent, touch-friendly controls. Responsive shell with sidebar on desktop and bottom tabs on mobile.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command      | Description          |
| ------------ | -------------------- |
| `pnpm dev`   | Development server   |
| `pnpm build` | Production build     |
| `pnpm start` | Run production build |
| `pnpm lint`  | ESLint               |

## Project structure (high level)

| Path                       | Role                            |
| -------------------------- | ------------------------------- |
| `app/`                     | Routes and pages                |
| `components/fitness/`      | Workout UI components           |
| `components/layout/`       | Navigation and shell            |
| `features/routine-import/` | Excel parser and import preview |
| `lib/mock-data.ts`         | Dashboard types and sample week |

## Current limitations

- Dashboard and most screens use **in-memory mock data** (changes are not persisted).
- Excel import **previews** the routine only; saving to a database is not implemented yet.
- No authentication or multi-user support.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Radix UI / shadcn
- [SheetJS `xlsx`](https://sheetjs.com/) for Excel read and template generation
