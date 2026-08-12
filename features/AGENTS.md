# Features

Domain modules with Server Actions and feature UI. Keep business logic here; pages compose.

## Modules

| Folder | Role |
|--------|------|
| `auth/` | `login`, `signup`, `logout` Server Actions; `LoginForm`, `SignupForm`, `LogoutButton` |
| `routine-import/` | Excel parse/preview; `saveRoutine` → Supabase; see `docs/ROUTINE-IMPORT.md` |
| `routines/` | DB types, `routineMapper`, editor model/patch/schema, session + routine Server Actions; `insertActiveRoutineTree.server` sets ownership via `auth.uid()` defaults (never caller `user_id`) |

## Sessions (`routines/actions/sessionActions.ts`)

Used by `/` via `hooks/use-workout-session.ts`:

- `getOrCreateDaySession` — load or create `workout_sessions` + set logs for a day
- `toggleSetLog`, `updateSetReps` — persist set completion / actual reps
- Reset / complete / reopen session helpers
- `addExerciseToDay` — ad-hoc exercise on the active day

## Editor (`routines/`)

`/editor` loads via mapper → `useRoutineEditor` → `computeRoutinePatch` → `updateRoutine`. Diff-based writes only.

## Constraints

- No `any`. Prefer existing action result shapes (`{ ok: true } | { ok: false; error: string }`).
- Progress = completed sets, not reps.
