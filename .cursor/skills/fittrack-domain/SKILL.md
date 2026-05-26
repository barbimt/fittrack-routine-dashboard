---
name: fittrack-domain
description: >-
  FitTrack workout domain model, types, progress calculations, and mock data in
  lib/mock-data.ts. Use when adding types, changing TrainingDay/Exercise/Set
  shapes, computing completed sets, or updating sample routines.
---

# FitTrack domain

## Types (`lib/mock-data.ts`)

- `ExerciseSet` — `completed` drives progress; `actualReps` optional
- `Exercise` — `sets[]` length = planned sets; `targetReps` can be `number | string` for display
- `TrainingDay` — `id`, `dayName`, `focus`, `exercises[]`

## Progress (pure functions)

```ts
getCompletedSets(day)   // sum of completed sets across exercises
getTotalSets(day)       // sum of sets.length
getExerciseProgress(ex) // { completed, total }
```

**Never** count reps toward progress — only `set.completed`.

## Editing mock data

- Keep Monday demo at **4 of 13 sets** unless user asks otherwise
- Preserve realistic exercise names/weights from spec (Hip Thrust 60kg, etc.)
- Use unique `id` per set/exercise

## When splitting files

Move types to `lib/types.ts`, data to `lib/default-routine.ts`, keep helpers in `lib/workout-utils.ts` — update imports in pages/components.

See [reference.md](reference.md) for entity diagram.
