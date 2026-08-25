# Architecture

## Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4 (`app/globals.css` + `@theme inline`)
- **UI primitives:** shadcn/ui + Radix (`components/ui/`)
- **Icons:** lucide-react
- **Excel:** SheetJS `xlsx` (client-side import on `/upload`)
- **Backend:** Supabase (Auth, Postgres, RLS)
- **Package manager:** pnpm

## Layering

```
app/{route}/page.tsx          →  screen composition (Server Components where data is needed)
        ↓
components/fitness/*          →  workout UI (props in, events up)
components/layout/*           →  navigation chrome
components/app-shell.tsx      →  responsive shell + optional aside
        ↓
features/auth/                →  login, signup, logout (Server Actions + Client forms)
features/routine-import/      →  Excel parse + import preview + save to Supabase (/upload)
features/routines/            →  DB types, routineMapper, editor model + diff patch + validation + actions
lib/mock-data.ts              →  dashboard types (TrainingDay, Exercise, ExerciseSet) + helpers
lib/supabase/                 →  Supabase client/server/middleware helpers
lib/design-tokens.ts          →  palette constants
        ↓
components/ui/*               →  shadcn primitives — no business logic
```

## App shell

`AppShell` wraps every main screen:

- **Desktop (`lg+`):** fixed `Sidebar` (64), main content, optional `aside` (e.g. `SummaryPanel` on `xl+`)
- **Mobile:** `Header` (hamburger) + `MobileNavDrawer`

Navigation uses Next.js `Link` routes.

## Data flow

### Dashboard (`/`)

```
app/page.tsx (Server Component)
  → supabase.auth.getUser()           if no session → redirect /login
  → supabase.from("routines")         if no active routine → empty dashboard CTAs
    .select("*, routine_days(*, routine_exercises(*))")
  → mapRoutineToTrainingDays()        RoutineWithDays → TrainingDay[]
  → getOrCreateDaySession()           workout_sessions + workout_set_logs for first day
  → <DashboardClient ... />           Client Component + useWorkoutSession
```

Set toggles and rep edits persist via Server Actions in
`features/routines/actions/sessionActions.ts` (`toggleSetLog`, `updateSetReps`,
reset/complete helpers). Day changes call `getOrCreateDaySession` again.

### Upload (`/upload`)

```
User selects .xlsx
  → parseRoutineWorkbook()            client-side SheetJS parse
  → ParsedRoutine in RoutineImportForm state
  → ImportPreview + ImportWarnings
  → user confirms → saveRoutine()     Server Action
      → DELETE existing routine by name (dedup)
      → INSERT routines (is_active: true)
      → INSERT routine_days
      → INSERT routine_exercises
  → success state → link to dashboard
```

### Routine editor (`/editor`)

```
app/editor/page.tsx (Server Component)
  → supabase.auth.getUser()           if no session → redirect /login
  → supabase.from("routines")         if no active routine → create-from-scratch editor
    .select("*, routine_days(*, routine_exercises(*))")
  → mapRoutineToEditor()              RoutineWithDays → EditorRoutine (editor-shaped)
  → <RoutineEditorClient routine={...} />

RoutineEditorClient (Client Component)
  → useRoutineEditor(routine)         state, CRUD, reorder, validation, save
      → useDirtyState(routine.days)   editable draft + baseline + isDirty (deepEqual)
  → on save:
      → validateRoutineDays()         Zod — block invalid (e.g. day with no exercises)
      → computeRoutinePatch()         diff baseline vs draft → minimal changes
      → updateRoutine(patch)          Server Action: DELETE/INSERT/UPDATE only what changed
      → router.refresh()              server re-sends data → useDirtyState re-seeds
```

Drag-and-drop (days + exercises) uses `@dnd-kit` via shared helpers in
`components/fitness/sortable-row.tsx`. Each `DndContext` gets a **stable `id`**
to avoid SSR/client hydration mismatches on its `aria-describedby`.

### Auth

```
/login or /signup
  → LoginForm / SignupForm (Client Component, useActionState)
  → login() / signup() Server Action
  → supabase.auth.signInWithPassword / signUp
  → redirect("/") on success

Sidebar LogoutButton
  → logout() Server Action
  → supabase.auth.signOut()
  → redirect("/login")

proxy.ts (Next.js 16 proxy)
  → updateSession() on every request
  → no session + private path → redirect /login
  → session + /login or /signup → redirect /
```

Keep progress helpers **pure**; mutations in Server Actions only.

## File conventions

- New screen: `app/{name}/page.tsx` + `navItems` in `components/layout/sidebar.tsx` if needed
- New fitness widget: `components/fitness/{name}.tsx` with explicit props interface
- Import logic: `features/routine-import/` — parser utils stay free of React
- `"use client"` when using hooks, file APIs, or Radix interactives

## Build & deploy

- `pnpm build` — run after non-trivial changes
- `pnpm lint` — ESLint
- Vercel Analytics in `app/layout.tsx` (production only)

## Related docs

- [ROUTINE-IMPORT.md](./ROUTINE-IMPORT.md) — Excel format, parser, preview UI, save flow
- [DOMAIN.md](./DOMAIN.md) — entity types, DB→UI mapping
- [supabase/001-setup.md](./supabase/001-setup.md) — env vars, Supabase project config
- [supabase/002-auth-nextjs-app-router.md](./supabase/002-auth-nextjs-app-router.md) — auth flow
- [supabase/003-database-schema-rls.md](./supabase/003-database-schema-rls.md) — schema, RLS, composite FKs
- [next/001-protected-routes.md](./next/001-protected-routes.md) — proxy, route rules
- [react/001-custom-hooks-and-dirty-state.md](./react/001-custom-hooks-and-dirty-state.md) — editor hooks, dirty tracking, diff patch
- [react/002-drag-and-drop-dnd-kit.md](./react/002-drag-and-drop-dnd-kit.md) — `@dnd-kit` sortable patterns + hydration
- [react/003-server-actions-and-refresh.md](./react/003-server-actions-and-refresh.md) — Server Actions, `revalidatePath`, `router.refresh()`
- [react/004-form-validation-with-zod.md](./react/004-form-validation-with-zod.md) — Zod validation, `safeParse`, error mapping
