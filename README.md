# FitTrack Routine Dashboard

Premium, mobile-first **visual UI prototype** for a fitness workout app. Built with Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui. Uses mocked data only — no backend, auth, Excel parsing, or persistence.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Screens & routes

| Route | Screen |
|-------|--------|
| `/` | Main workout dashboard (Today's Workout) |
| `/upload` | Routine upload mock (dropzone, validation states) |
| `/week` | Weekly overview |
| `/progress` | Progress / analytics mock |
| `/editor` | Routine editor mock |
| `/empty` | Empty state (no routine) |
| `/settings` | Settings placeholder |

## Design system — color palette

Calm, minimal tokens (also in `app/globals.css` and `lib/design-tokens.ts`):

| Token | Role | Value direction |
|-------|------|-----------------|
| `background` | App canvas | Warm off-white / stone |
| `surface` | Cards, panels | White / soft cream |
| `surface-muted` | Nested areas, chips | Soft stone |
| `border` | Dividers | Light stone |
| `text-primary` | Headings, emphasis | Deep charcoal |
| `text-secondary` | Labels | Medium gray |
| `text-muted` | Hints, meta | Muted gray |
| `accent` / `primary` | CTAs, progress | Muted sage / olive |
| `accent-soft` | Notes, highlights | Pale sage wash |
| `success` | Completed sets | Soft green |
| `warning` | Alerts | Muted amber |
| `danger` / `destructive` | Errors | Soft red |

Tailwind usage examples: `bg-background`, `bg-card`, `bg-surface-muted`, `text-muted-foreground`, `bg-accent-soft`, `text-success`.

## Component map

### Layout
- `components/app-shell.tsx` — shell with sidebar + header + mobile nav
- `components/layout/sidebar.tsx`
- `components/layout/header.tsx`
- `components/layout/mobile-navigation.tsx`

### Fitness UI
- `DaySelector`, `DailyProgressCard`, `ExerciseCard`, `SetRow`
- `ProgressBar`, `StatCard`, `UploadDropzone`, `EmptyState`
- `WeeklyDayCard`, `AnalyticsCard`, `SummaryPanel`
- `RoutineEditorMock`
- `Badge`, `Button`, `Input` (in `components/fitness/`)

### Data
- `lib/mock-data.ts` — training days, exercises, sets

## Next steps in Cursor

1. Add React state for set completion and rep inputs on `/`.
2. Wire navigation and optional route guards.
3. Implement Excel upload parsing on `/upload`.
4. Replace chart placeholders on `/progress`.
5. Connect routine editor to real CRUD + API.

## Scripts

- `pnpm dev` — development server
- `pnpm build` — production build
- `pnpm lint` — ESLint
