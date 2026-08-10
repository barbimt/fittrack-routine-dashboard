# Lib

Shared utilities and clients. Keep types and pure helpers here; mutations stay in `features/*/actions`.

## Key files

| Path | Role |
|------|------|
| `mock-data.ts` | Dashboard UI types (`TrainingDay`, `Exercise`, `ExerciseSet`) + sample week + progress helpers |
| `design-tokens.ts` | Palette / theme color constants |
| `deep-equal.ts` | Used by dirty-state / editor |
| `supabase/client.ts` | Browser Supabase client |
| `supabase/server.ts` | Server Component / Server Action client |
| `supabase/middleware.ts` | Session refresh + public/private path redirects |

## Types vs database

- UI screens use shapes from `mock-data.ts`.
- DB rows map through `features/routines/routineMapper.ts` (and editor mappers).
- Mock `trainingDays` feed `/demo`, `/week`, and tests — not the live `/` dashboard.

## Rules

- No `any`. No `localStorage` unless the user explicitly asks.
- Progress helpers must stay pure (completed sets / total sets).
