---
name: fittrack-workout-state
description: >-
  Implement React state for FitTrack workout sessions: toggle set completion, edit
  reps, select training day, reset day/exercise. Use when wiring dashboard logic,
  context, hooks, or replacing mock callbacks on app/page.tsx.
---

# FitTrack workout state

## Goal

Make `/` interactive while keeping `ExerciseCard` / `SetRow` presentational.

## Recommended approach

1. Create `hooks/use-workout.ts` or `context/workout-context.tsx`
2. Initialize from `trainingDays` (deep clone if mutating)
3. Expose:
   - `selectedDayId`, `setSelectedDayId`
   - `toggleSet(dayId, exerciseId, setId)`
   - `updateReps(dayId, exerciseId, setId, reps: number | null)`
   - `resetDay(dayId)`, `resetExercise(dayId, exerciseId)`
4. Pass handlers into `ExerciseCard` from `app/page.tsx`

## Immutable update pattern

```ts
function toggleSet(days: TrainingDay[], dayId: string, setId: string): TrainingDay[] {
  return days.map((day) =>
    day.id !== dayId
      ? day
      : {
          ...day,
          exercises: day.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) =>
              s.id === setId ? { ...s, completed: !s.completed } : s
            ),
          })),
        }
  );
}
```

## SetRow inputs

- Use **controlled** `value` when state is wired
- Completing a set may auto-fill `actualReps` with `targetReps` (optional UX — ask user)

## Progress display

Recompute with existing helpers:

```ts
const completed = getCompletedSets(selectedDay);
const total = getTotalSets(selectedDay);
```

## Do not

- Store progress separately from `sets[].completed` (single source of truth)
- Use `localStorage` until user requests persistence (Phase 2)

See `docs/ROADMAP.md` Phase 1.
