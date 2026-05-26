---
name: fittrack-excel-import
description: >-
  Plan and implement Excel (.xlsx) routine import for FitTrack upload page. Use
  when parsing spreadsheets, validating columns, mapping rows to TrainingDay, or
  extending UploadDropzone and app/upload/page.tsx.
---

# FitTrack Excel import

## Current state

`/upload` is **visual only** — `UploadDropzone` mocks file selection; no parsing.

## Expected spreadsheet columns

| Column | Maps to |
|--------|---------|
| Day | Group → `TrainingDay.dayName` / `id` slug |
| Exercise | `Exercise.name` |
| Muscle | `Exercise.muscleGroup` |
| Sets | `Exercise.targetSets` + number of `ExerciseSet` rows |
| Reps | `Exercise.targetReps` + each set `targetReps` |
| Weight | `Exercise.weight` |
| Rest | `Exercise.restTime` |

## Implementation steps

1. Add dependency only when implementing (e.g. `xlsx` / SheetJS) — user must approve
2. Parse file in client or API route; prefer validation before mutating app state
3. Build `TrainingDay[]`:
   - Group rows by day
   - Generate `ExerciseSet[]` with `completed: false`, `actualReps: null`
4. Surface errors in `UploadDropzone` `error` prop; success → preview + "Import routine"
5. On import: replace routine in workout state / storage

## Validation messages

- Wrong extension → `.xlsx only`
- Missing headers → list required columns
- Empty sheet → friendly empty state

## UI

Keep existing format table on upload page; wire "Download template" later.

Do **not** implement parsing until user explicitly asks to implement (not just plan).

See `app/upload/page.tsx` and `components/fitness/upload-dropzone.tsx`.
