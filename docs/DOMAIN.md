# Domain model

## Dashboard entities (`lib/mock-data.ts`)

Used on `/`, `/week`, and related screens. Progress = **completed sets**, not reps.

### ExerciseSet

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Stable key |
| `setNumber` | number | 1-based display |
| `targetReps` | number | Per-set target |
| `actualReps` | number \| null | User entry |
| `completed` | boolean | Drives progress |

### Exercise

| Field | Type | Notes |
|-------|------|-------|
| `targetSets` | number | Count of set rows |
| `targetReps` | number \| string | Display label |
| `weight` | string | e.g. `"60kg"` |
| `restTime` | string | e.g. `"90s"` |
| `sets` | ExerciseSet[] | Length = `targetSets` |

### TrainingDay

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | UUID from `routine_days.id` when loaded from DB; short slug in mocks |
| `dayName` | string | `routine_days.original_name` (Excel sheet name) |
| `focus` | string | `routine_days.focus` parsed after ` - ` in sheet name |
| `exercises` | Exercise[] | |

## Progress rules

```text
exerciseCompletedSets = sets.filter(s => s.completed).length
dayCompletedSets      = sum over exercises of exerciseCompletedSets
dayTotalSets          = sum over exercises of sets.length
dayProgressLabel      = "{dayCompletedSets} of {dayTotalSets} sets completed"
```

Reps do not affect progress.

## Mock training week

| Day | Focus |
|-----|-------|
| Monday | Glutes & Hamstrings |
| Tuesday | Upper Body |
| Wednesday | Core & Mobility |
| Thursday | Quads & Glutes |
| Friday | Full Body |

Monday demo: **4 / 13 sets** completed (Hip Thrust 2/4, RDL 2/3, etc.).

## Import entities (`features/routine-import/types.ts`)

Parsed from Excel on `/upload`. Saved to Supabase via `saveRoutineAction`. Mapped to `TrainingDay[]` via `features/routines/routineMapper.ts` before being rendered on the dashboard.

### ParsedRoutineExercise

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | From EXERCISE column |
| `prescription` | string | Raw SETS x REPS cell |
| `plannedSets` | number \| null | From `parsePrescription` |
| `targetReps` | string \| null | From `parsePrescription` |
| `weight` | string \| null | |
| `notes` | string \| null | |
| `sortOrder` | number | Row order in sheet |

### ParsedRoutineDay

| Field | Type | Notes |
|-------|------|-------|
| `originalName` | string | Excel sheet name |
| `name` | string | Parsed short name |
| `focus` | string \| null | Parsed after ` - ` in sheet name |
| `sortOrder` | number | Sheet index in workbook |
| `exercises` | ParsedRoutineExercise[] | |

### ParsedRoutine

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Derived from upload filename |
| `source` | `"excel"` | |
| `days` | ParsedRoutineDay[] | |
| `warnings` | ImportWarning[] | |

## Mapping DB → dashboard (`features/routines/routineMapper.ts`)

`mapRoutineToTrainingDays(routine: RoutineWithDays): TrainingDay[]`

| DB field | UI field | Notes |
|----------|----------|-------|
| `routine_days.id` | `TrainingDay.id` | UUID |
| `routine_days.original_name` | `TrainingDay.dayName` | Raw Excel sheet name |
| `routine_days.focus` | `TrainingDay.focus` | Fallback: `name` |
| `routine_exercises.id` | `Exercise.id` | UUID |
| `routine_exercises.planned_sets` | `Exercise.targetSets` | Fallback: `0` |
| `routine_exercises.target_reps` | `Exercise.targetReps` | Fallback: `prescription` |
| `routine_exercises.weight` | `Exercise.weight` | Fallback: `"—"` |
| `routine_exercises.rest_time` | `Exercise.restTime` | Fallback: `"—"` |
| `routine_exercises.muscle_group` | `Exercise.muscleGroup` | Fallback: day `focus` / `name` |

`ExerciseSet[]` is generated from `planned_sets` (default 3). All sets start `completed: false`, `actualReps: null`. Set IDs use format `{exerciseId}-set-{n}`.

Full import spec: [ROUTINE-IMPORT.md](./ROUTINE-IMPORT.md).

## IDs

Dashboard loads use UUID ids from the DB. Mock data uses short ids (`ex1`, `s1`, `monday`) — still used for tests and `/demo` / `/week`.
