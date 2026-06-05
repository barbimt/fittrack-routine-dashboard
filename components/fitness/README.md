# Fitness components

Presentational workout UI. Props in, events up — no Supabase or routing here.

## Files

| Component | Purpose |
|-----------|---------|
| `button.tsx`, `input.tsx`, `badge.tsx` | FitTrack-themed wrappers over `components/ui/*` |
| `set-row.tsx` | One set: checkbox, target reps, editable actual reps (debounced save + auto-complete) |
| `exercise-card.tsx` | Collapsible exercise block; lists `SetRow`s |
| `day-selector.tsx` | Horizontal day pills |
| `daily-progress-card.tsx` | Selected day progress (`completed/total` sets) |
| `summary-panel.tsx` | Desktop `xl+` aside: today, muscle focus, week |
| `dashboard-client.tsx` | **Stateful** dashboard page client (optimistic toggles, session cache) |
| `progress-bar.tsx`, `stat-card.tsx` | Reusable metrics widgets |
| `weekly-day-card.tsx` | Day summary for `/week` |
| `analytics-card.tsx` | Chart shell + `ChartPlaceholder` |
| `empty-state.tsx` | Icon + title + CTA pattern |
| `upload-dropzone.tsx` | Excel file picker (used by routine import) |
| `routine-editor-mock.tsx` | `/editor` prototype |

## Set row behavior

Documented here (not in code comments):

- `localValue` syncs from `set.actualReps` on mount; remounts when `key={set.id}` changes (day switch).
- Typing updates parent via `onRepsChange`; persist via `onRepsSave` on blur or after 400ms debounce.
- Entering reps ≥ 1 auto-checks the set; clearing to 0 auto-unchecks.

## Dashboard client

- `sessionCache` ref avoids re-fetching `getOrCreateDaySession` when re-selecting a day.
- Set toggles/reps only persist when `set.id` is a UUID (materialised `workout_set_logs` row).
- Optimistic UI with revert on `toggleSetLog` failure.

## Conventions

- Named export + explicit `interface XxxProps`
- `cn()` from `@/lib/utils`
- Progress = **completed sets**, not reps
