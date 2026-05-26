# Domain model

## Entities

### ExerciseSet

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Stable key |
| `setNumber` | number | 1-based display |
| `targetReps` | number | Per-set target (even if exercise uses string reps label) |
| `actualReps` | number \| null | User entry; null = empty |
| `completed` | boolean | Drives progress |

### Exercise

| Field | Type | Notes |
|-------|------|-------|
| `targetSets` | number | Count of set rows |
| `targetReps` | number \| string | Display e.g. `10` or `"10 each leg"` |
| `weight` | string | Display e.g. `"60kg"`, `"Bodyweight"` |
| `restTime` | string | Display e.g. `"90s"` |
| `sets` | ExerciseSet[] | Length should match `targetSets` |

### TrainingDay

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `monday` |
| `dayName` | string | e.g. `Monday` |
| `focus` | string | e.g. `Glutes & Hamstrings` |
| `exercises` | Exercise[] | |

## Progress rules

```text
exerciseCompletedSets = sets.filter(s => s.completed).length
dayCompletedSets      = sum over exercises of exerciseCompletedSets
dayTotalSets          = sum over exercises of sets.length
dayProgressLabel      = "{dayCompletedSets} of {dayTotalSets} sets completed"
```

**Reps do not affect progress** — only `completed` on each set.

## Mock training week

| Day | Focus |
|-----|-------|
| Monday | Glutes & Hamstrings |
| Tuesday | Upper Body |
| Wednesday | Core & Mobility |
| Thursday | Quads & Glutes |
| Friday | Full Body |

Monday demo state: **4 / 13 sets** — Hip Thrust sets 1–2 done, RDL sets 1–2 done.

## Excel import (planned)

Expected columns: Day, Exercise, Muscle, Sets, Reps, Weight, Rest.

Map rows → `TrainingDay[]` grouped by day name. See skill `fittrack-excel-import`.

## IDs

Use short prefixed ids in mocks (`ex1`, `s1`). In real app prefer `crypto.randomUUID()` or stable slugs from import.
