# Roadmap

Phases for growing the prototype in Cursor. Check off in PRs or issues as you go.

## Phase 1 — Workout session state (client)

- [ ] `WorkoutProvider` or hook holding `trainingDays` in React state
- [ ] Toggle set `completed` from `SetRow` checkbox
- [ ] Edit `actualReps` (controlled inputs)
- [ ] Reset single exercise / whole day
- [ ] Selected day synced with `DaySelector` (already partial on `/`)

**Files:** `app/page.tsx`, `components/fitness/exercise-card.tsx`, `set-row.tsx`, new `hooks/use-workout.ts` or `context/workout-context.tsx`

## Phase 2 — Persistence

- [ ] Load/save routine + progress (`localStorage` or API — decide)
- [ ] Route to `/empty` when no routine exists
- [ ] "Use sample routine" seeds from `trainingDays` default export

## Phase 3 — Excel import

- [ ] Parse `.xlsx` on `/upload` (e.g. `xlsx` / `sheetjs`)
- [ ] Validate columns; surface errors in `UploadDropzone`
- [ ] Replace mock with imported `TrainingDay[]`

## Phase 4 — Routine editor

- [ ] CRUD exercises and days in `RoutineEditorMock`
- [ ] Reorder (optional drag-and-drop)
- [ ] Save merges into source of truth

## Phase 5 — Analytics

- [ ] Derive weekly volume / muscle group stats from real completion data
- [ ] Charts on `/progress` (recharts already in package.json — use only if needed)

## Phase 6 — Product polish

- [ ] Rest timer (optional)
- [ ] Settings wired (units, theme)
- [ ] Tests for pure helpers in `lib/`

## Non-goals (unless requested)

Auth, social, cloud sync, native apps, dark bodybuilding theme.
