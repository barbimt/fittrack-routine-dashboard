# Fitness components

Presentation layer for workouts. Props in, events up — no direct Supabase calls.

## Main surfaces

| Component | Used on |
|-----------|---------|
| `dashboard-client.tsx` | `/` — day select, exercises, session actions via hook |
| `demo-dashboard-client.tsx` | `/demo` — mock data only |
| `routine-editor-client.tsx` + `routine-editor-*` | `/editor` |
| `upload-dropzone.tsx` | Upload chrome (import form lives in `features/routine-import/`) |
| `empty-state.tsx` | `/empty` |
| `set-row.tsx`, `exercise-card.tsx` | Set checkboxes + reps |
| `day-selector.tsx`, `daily-progress-card.tsx`, `summary-panel.tsx` | Progress UI |
| `sortable-row.tsx` | Shared `@dnd-kit` helpers for editor reorder |

## Patterns

- App chrome primitives: `button.tsx`, `input.tsx`, `badge.tsx` (prefer over raw `components/ui` in fitness screens).
- Calm stone / sage styling; no neon gym colors.
- Wire persistence through hooks (`useWorkoutSession`, `useRoutineEditor`) and feature actions, not inside these components.
- Mobile inputs: keep `text-base` (≥16px) on small screens (`md:text-sm` ok on desktop). Overriding with bare `text-sm` triggers iOS Safari/Chrome focus zoom and breaks the layout.
