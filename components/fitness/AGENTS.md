# Fitness components

Presentational workout UI. Props in, events up — no Supabase or routing here.

## Files

| Component | Purpose |
|-----------|---------|
| `button.tsx`, `input.tsx`, `badge.tsx` | FitTrack-themed wrappers over `components/ui/*` |
| `set-row.tsx` | One set: 2-row CSS grid below `lg` (checkbox + set + actual, then target); single-row flex on desktop; checkbox, target reps, editable actual reps (debounced save + auto-complete) |
| `weight-label.tsx` | Shared load icon + `SetTargetLabel` / `PrescriptionBlockLine` for exercise and set targets |
| `exercise-card.tsx` | Collapsible exercise block; lists `SetRow`s; optional per-exercise reset |
| `day-selector.tsx` | Horizontal day pills |
| `daily-progress-card.tsx` | Selected day progress (`completed/total` sets) |
| `summary-panel.tsx` | Desktop `xl+` aside: today, muscle focus, week |
| `workout-save-panel.tsx` | Save / edit / reset-day footer banner + copy helper |
| `reset-day-dialog.tsx` | Confirm before clearing today’s session |
| `dashboard-client.tsx` | **Layout** dashboard; state in `hooks/use-workout-session.ts` |
| `progress-bar.tsx`, `stat-card.tsx` | Reusable metrics widgets |
| `weekly-day-card.tsx` | Day summary for `/week` |
| `analytics-card.tsx` | Chart shell + `ChartPlaceholder` |
| `empty-state.tsx` | Icon + title + CTA pattern |
| `upload-dropzone.tsx` | Excel file picker (used by routine import) |
| `routine-editor-client.tsx` | `/editor` orchestrator: wires `useRoutineEditor` to day cards + save footer |
| `routine-editor-day-card.tsx` | Sortable day card: day fields, exercise list (own `DndContext`), add/delete |
| `routine-editor-exercise-row.tsx` | Sortable exercise row: name/muscle/sets/reps/weight/rest/notes + delete |
| `routine-editor-fields.tsx` | Reusable editor fields (`EditorField`, `Editor*Field`, `MuscleSelect`) + `StatusBanner`, `emptyToNull` |
| `sortable-row.tsx` | dnd-kit helpers: `useEditorSensors`, `useSortableRow`, `DragHandle` |

## Set row behavior

- `localValue` syncs from `set.actualReps` when the input is not focused; remounts via `setRowRevision` key on reset.
- Typing updates parent via `onRepsChange`; persist via `onRepsSave` on blur or after 400ms debounce.
- Entering reps ≥ 1 auto-checks the set; clearing to 0 auto-unchecks.
- Checking a set with no actual reps auto-fills `targetReps` in state and persists via `updateSetReps` (hook); existing actual reps are kept.
- Unchecking a set clears actual reps in state and persists `null` via `updateSetReps`.
- Tap/click anywhere on the row toggles completion (except the actual-reps input area); checkbox keeps keyboard focus.

## Prescription display

- Variable blocks (`1x12 15kg-3x12 20kg`) expand to per-set `targetReps` + `targetWeight` via `parsePrescription` / `routineMapper`.
- Exercise header uses `getPrescriptionBlockSummaries`; each set uses `SetTargetLabel` from `weight-label.tsx`.

## Dashboard client

- State and handlers: `hooks/use-workout-session.ts`
- Set mutations: `features/routines/dashboardDayState.ts` (`updateSetInDays`, `findSetInDays`, reset helpers)
- `sessionIdsByDayId` caches day session ids; avoids re-fetching `getOrCreateDaySession` when re-selecting a day.
- Set toggles/reps only persist when `set.id` is a UUID (materialised `workout_set_logs` row).
- Optimistic UI with revert on `toggleSetLog` / reset failures.
- **Reset exercise**: per-card button (visible when exercise has completed sets); calls `resetExerciseSets`.
- **Reset day**: header button; clears all sets for today’s session via `resetDaySession`. Confirmation dialog before reset.
- **Save workout**: enabled once at least one set is complete; first save vs re-save show different banner/toast copy.
- **Edit workout**: reopens a saved session (`in_progress`) for edits; shows Save again when done.
- **Reset day** (when saved): shown next to Edit workout in the footer; clears today’s session and exits read-only mode.

## Routine editor

- State + behavior live in `hooks/use-routine-editor.ts` (`useRoutineEditor`): working copy of days, dirty tracking, validation, patch-based save. Components stay presentational.
- Receives `EditorRoutine` (`features/routines/editorTypes.ts`) loaded server-side on `/editor` from the active Supabase routine.
- New days/exercises get `new-*` ids (`createNewId`) so the server treats them as inserts.
- Drag via `@dnd-kit` through `sortable-row.tsx` helpers: outer sortable list reorders days, inner per-day list reorders exercises (handle = `DragHandle`). Each `DndContext` has a stable `id` to avoid SSR hydration mismatches.
- Fields come from `routine-editor-fields.tsx`; muscle uses the fixed `MUSCLE_GROUPS` list (sentinel `MUSCLE_GROUP_NONE` = no selection).
- **Prescription field** (`routine-editor-exercise-row.tsx`): same format as Excel import (e.g. `1x12 15kg-3x12 20kg`). Editing it syncs Sets/Reps via `editorPatchFromPrescription`; preview uses `PrescriptionBlockLine`. When loads are in the prescription text, Weight shows as read-only (“Per set — see preview above”); Sets/Reps lock with “Synced from prescription”. Simple `3x12` routines use Sets/Reps/Weight as before. Save resolves via `resolvePrescriptionForSave` in `features/routines/editorPrescription.ts`.
- On save: `validateRoutineDays` (zod) blocks invalid routines (empty day name, no exercises, invalid sets) and surfaces per-day errors; otherwise `computeRoutinePatch` sends only changes to `updateRoutine`, then `router.refresh()` re-seeds the baseline with persisted UUIDs. **Save routine** (footer) is disabled until dirty.

## Conventions

- Named export + explicit `interface XxxProps`
- `cn()` from `@/lib/utils`
- Progress = **completed sets**, not reps
