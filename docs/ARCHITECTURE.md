# Architecture

## Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript (strict — no `any`)
- **Styling:** Tailwind CSS 4 (`app/globals.css` + `@theme inline`)
- **UI primitives:** shadcn/ui + Radix (`components/ui/`)
- **Icons:** lucide-react
- **Package manager:** pnpm

## Layering

```
app/{route}/page.tsx     →  screen composition (prefer "use client" when state needed)
        ↓
components/fitness/*     →  domain UI (props in, events up)
components/layout/*      →  navigation chrome
components/app-shell.tsx →  responsive shell + optional aside
        ↓
lib/mock-data.ts         →  types + mock data + pure helpers (today)
lib/design-tokens.ts   →  palette constants
        ↓
components/ui/*          →  shadcn — do not put business logic here
```

## App shell

`AppShell` wraps every main screen:

- **Desktop (`lg+`):** fixed `Sidebar` (64), main content, optional `aside` (e.g. `SummaryPanel` on `xl+`)
- **Mobile:** `Header` (menu), content, `MobileNavigation` (bottom tabs, first 5 routes)

Navigation is real Next.js `Link` routes — not a single-page tab switcher.

## Data flow (today vs target)

**Today (prototype):**

- Static `trainingDays` in `lib/mock-data.ts`
- Pages use `useState` for UI-only (e.g. selected day)
- `ExerciseCard` callbacks are no-ops or `console.log`

**Target:**

```
Source of truth (context / zustand / server)
  → lib/mock-data types unchanged or moved to lib/types.ts
  → helpers: getCompletedSets, getTotalSets, getExerciseProgress
  → components receive data + dispatch actions
```

Keep helpers **pure**; put mutation in hooks or server actions later.

## File conventions

- New screen: `app/{name}/page.tsx` + register in `components/layout/sidebar.tsx` `navItems` if needed
- New fitness widget: `components/fitness/{name}.tsx` with explicit props interface
- Client components: `"use client"` only when using hooks or browser APIs

## Build & deploy

- `pnpm build` — static/SSR pages as configured by Next
- Vercel Analytics optional in `app/layout.tsx` (production only)
