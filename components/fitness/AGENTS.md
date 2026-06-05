# Fitness components

Presentational workout UI. Props in, events up — no Supabase or routing here.

## Files

| Component | Purpose |
|-----------|---------|
| `button.tsx`, `input.tsx`, `badge.tsx` | FitTrack-themed wrappers over `components/ui/*` |
| `set-row.tsx` | One set: checkbox, target reps, editable actual reps (debounced save + auto-complete) |
| `exercise-card.tsx` | Collapsible exercise block; lists `SetRow`s; optional per-exercise reset |
| `day-selector.tsx` | Horizontal day pills |
| `daily-progress-card.tsx` | Selected day progress (`completed/total` sets) |
| `summary-panel.tsx` | Desktop `xl+` aside: today, muscle focus, week |
| `workout-save-panel.tsx` | Save / edit / reset-day footer banner + copy helper |
| `dashboard-client.tsx` | **Layout** dashboard; state in `hooks/use-workout-session.ts` |
| `progress-bar.tsx`, `stat-card.tsx` | Reusable metrics widgets |
| `weekly-day-card.tsx` | Day summary for `/week` |
| `analytics-card.tsx` | Chart shell + `ChartPlaceholder` |
| `empty-state.tsx` | Icon + title + CTA pattern |
| `upload-dropzone.tsx` | Excel file picker (used by routine import) |
| `routine-editor-mock.tsx` | `/editor` prototype |

## Set row behavior

- `localValue` syncs from `set.actualReps` when the input is not focused; remounts via `setRowRevision` key on reset.
- Typing updates parent via `onRepsChange`; persist via `onRepsSave` on blur or after 400ms debounce.
- Entering reps ≥ 1 auto-checks the set; clearing to 0 auto-unchecks.
- Tap/click anywhere on the row toggles completion (except the actual-reps input area); checkbox keeps keyboard focus.

## Dashboard client

- State and handlers: `hooks/use-workout-session.ts`
- Set mutations: `features/routines/dashboardDayState.ts` (`updateSetInDays`, `findSetInDays`, reset helpers)
- `sessionIdsByDayId` caches day session ids; avoids re-fetching `getOrCreateDaySession` when re-selecting a day.
- Set toggles/reps only persist when `set.id` is a UUID (materialised `workout_set_logs` row).
- Optimistic UI with revert on `toggleSetLog` / reset failures.
- **Reset exercise**: per-card button (visible when exercise has completed sets); calls `resetExerciseSets`.
- **Reset day**: header button; clears all sets for today’s session via `resetDaySession`.
- **Save workout**: enabled once at least one set is complete; first save vs re-save show different banner/toast copy.
- **Edit workout**: reopens a saved session (`in_progress`) for edits; shows Save again when done.
- **Reset day** (when saved): shown next to Edit workout in the footer; clears today’s session and exits read-only mode.

## Conventions

- Named export + explicit `interface XxxProps`
- `cn()` from `@/lib/utils`
- Progress = **completed sets**, not reps
