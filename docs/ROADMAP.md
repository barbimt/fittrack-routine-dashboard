# Roadmap

Phases for growing the app. Update checkboxes when work ships.

## Phase 1 — Workout session state (done)

- [x] Hook holding day/session state for the dashboard (`useWorkoutSession`)
- [x] Toggle set `completed` from `SetRow` checkbox
- [x] Edit `actualReps` (controlled inputs)
- [x] Reset single exercise / whole day
- [x] Selected day synced with `DaySelector` on `/`

**Files:** `app/page.tsx`, `components/fitness/*`, `hooks/use-workout-session.ts`, `features/routines/actions/sessionActions.ts`

## Phase 2 — Persistence (done)

- [x] Load/save routine + session progress via Supabase
- [x] Route to `/empty` when no active routine exists
- [x] Public `/demo` sample from `lib/mock-data` (not a DB seed path)

## Phase 3 — Excel import

### 3a — Parse and preview (done)

- [x] `xlsx` dependency; `features/routine-import/`
- [x] Parse `.xlsx` on `/upload` → `ParsedRoutine`
- [x] English headers; Spanish aliases
- [x] `parsePrescription` (including `×` normalization)
- [x] Preview UI, warnings, expandable exercise list per day
- [x] Download template (`fittrack-routine-template.xlsx`)
- [x] Docs: `docs/ROUTINE-IMPORT.md`

### 3b — Save + load from Supabase (done)

- [x] Supabase Auth + protected routes (`features/auth/`, session middleware)
- [x] Database schema with RLS + composite FK integrity (`supabase/schema.sql`)
- [x] Persist `ParsedRoutine` → `routines` + `routine_days` + `routine_exercises`
- [x] Enable **Import routine** button; success state with counts + navigation
- [x] Deduplicate on reimport (delete by name before insert)
- [x] Load active routine from Supabase on dashboard (`app/page.tsx` Server Component)
- [x] Mapper `RoutineWithDays` → `TrainingDay[]` (`features/routines/routineMapper.ts`)
- [x] Route to `/empty` when no active routine exists

**Files:** `features/routine-import/actions/saveRoutineAction.ts`, `features/routines/`, `lib/supabase/`, `app/page.tsx`, `components/fitness/dashboard-client.tsx`

## Phase 4 — Routine editor (done)

- [x] Load active routine from Supabase into `/editor` (Server Component)
- [x] CRUD days and exercises (rename, add, remove)
- [x] Per-exercise `muscle_group` select (`routine_exercises.muscle_group`)
- [x] Drag-and-drop reorder for days and exercises (`@dnd-kit`)
- [x] Bottom save button, disabled until dirty
- [x] Diff-based persistence: `computeRoutinePatch` → `updateRoutine` Server Action (only changed entities are written)
- [x] Zod validation (`editorSchema`) — a day must keep at least one exercise
- [x] Reusable hooks/utils: `useRoutineEditor`, `useDirtyState`, `deepEqual`

**Files:** `app/editor/page.tsx`, `components/fitness/routine-editor-*`, `components/fitness/sortable-row.tsx`, `hooks/use-routine-editor.ts`, `hooks/use-dirty-state.ts`, `lib/deep-equal.ts`, `features/routines/{editorTypes,editorSchema,routinePatch,prescription}.ts`, `features/routines/actions/routineActions.ts`

## Phase 5 — Analytics

- [ ] Weekly volume / muscle group stats from real completion data
- [ ] Wire `/week` and `/progress` to `workout_sessions` / set logs
- [ ] Charts on `/progress` (recharts in package.json — use only if needed)

## Phase 6 — Product polish

- [ ] Rest timer (optional)
- [ ] Settings wired (units, theme)
- [ ] Broader test coverage for pure helpers in `lib/` and `features/`

## Non-goals (unless requested)

Social features, multi-tenant admin, native apps, neon gym theme, `localStorage` persistence (unless explicitly requested).
