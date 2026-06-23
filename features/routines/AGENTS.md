# Routines & workout sessions

Maps Supabase rows to dashboard UI types and persists set completion/reps.

## Files

| Path | Role |
|------|------|
| `types.ts` | DB row types (`Routine`, `RoutineDay`, `WorkoutSetLog`, joins) |
| `routineMapper.ts` | `RoutineWithDays` → `TrainingDay[]`; `mergeSetLogsIntoDay` |
| `editorTypes.ts` | `EditorRoutine/EditorDay/EditorExercise` + `mapRoutineToEditor`; `createNewId` (`new-*` ids = inserts) |
| `muscleGroups.ts` | Fixed muscle list + `MUSCLE_GROUP_NONE` for the editor select |
| `prescription.ts` | `buildPrescription(sets, reps)` — NOT NULL `prescription` string |
| `routinePatch.ts` | `computeRoutinePatch` — client-side diff (baseline vs current) → minimal `RoutineEditPatch` |
| `dashboardDayState.ts` | Pure set/day mutations + `canSaveWorkoutForDay` for dashboard |
| `actions/sessionActions.ts` | `getOrCreateDaySession`, `toggleSetLog`, `updateSetReps`, `resetExerciseSets`, `resetDaySession`, `completeDaySession`, `reopenDaySession` |
| `actions/routineActions.ts` | `updateRoutine(patch)` — applies a `RoutineEditPatch` (writes only changed/added/removed rows) |

## `getOrCreateDaySession`

1. Find `workout_sessions` for user + `routine_day_id` + today's date
2. If missing: insert session, then materialise one `workout_set_log` per planned set per exercise
3. Return session id, status, and all set logs for that session

## Editor save (patch-based)

The client computes a minimal diff so a single field edit is one UPDATE (not a full-routine rewrite):

1. `computeRoutinePatch(routineId, baseline, current)` (`routinePatch.ts`) compares the last-saved baseline to current state. Array position is the effective `sortOrder` (reorders detected without the stored field). Emits `upsertDays` / `upsertExercises` (changed + new) and `deleteDayIds` / `deleteExerciseIds`.
2. `updateRoutine(patch)` verifies ownership, deletes removed exercises then days (day delete cascades), inserts new days (mapping `new-*` ids → real UUIDs), updates changed days, then upserts exercises resolving their `dayId`. Rebuilds `prescription` from sets/reps.
3. `revalidatePath("/")` and `revalidatePath("/editor")`; client `router.refresh()` re-seeds the baseline with persisted UUIDs.

Updating a routine does **not** rewrite already-created `workout_sessions`/`workout_set_logs` for today (they map by `set_number`); changes apply to new sessions.

## Types

Manually maintained to match `supabase/schema.sql` until Supabase CLI type generation is wired up.

## Related

- `lib/mock-data.ts` — `TrainingDay`, `Exercise`, `ExerciseSet` (UI shape)
- `components/fitness/dashboard-client.tsx` — consumer
