# Routines & workout sessions

Maps Supabase rows to dashboard UI types and persists set completion/reps.

## Files

| Path | Role |
|------|------|
| `types.ts` | DB row types (`Routine`, `RoutineDay`, `WorkoutSetLog`, joins) |
| `routineMapper.ts` | `RoutineWithDays` → `TrainingDay[]`; `mergeSetLogsIntoDay` |
| `actions/sessionActions.ts` | `getOrCreateDaySession`, `toggleSetLog`, `updateSetReps` |

## `getOrCreateDaySession`

1. Find `workout_sessions` for user + `routine_day_id` + today's date
2. If missing: insert session, then materialise one `workout_set_log` per planned set per exercise
3. Return session id + all set logs for that session

## Types

Manually maintained to match `supabase/schema.sql` until Supabase CLI type generation is wired up.

## Related

- `lib/mock-data.ts` — `TrainingDay`, `Exercise`, `ExerciseSet` (UI shape)
- `components/fitness/dashboard-client.tsx` — consumer
