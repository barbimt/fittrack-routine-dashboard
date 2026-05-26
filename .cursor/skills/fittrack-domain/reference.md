# Domain reference

```text
TrainingDay
├── id, dayName, focus
└── exercises[] → Exercise
    ├── name, muscleGroup, targetSets, targetReps, weight, restTime, notes?
    └── sets[] → ExerciseSet
        ├── setNumber, targetReps, actualReps?, completed
        └── progress: completed === true counts +1 for day total
```

## Weekly stats (future)

Derive from stored completion history; `weeklyStats` in mock-data is static placeholder for `/week` and `/progress`.
