# Lib

Shared utilities, types, and Supabase clients.

## Files

| Path | Role |
|------|------|
| `mock-data.ts` | Dashboard types (`TrainingDay`, `Exercise`, `ExerciseSet`), sample week, progress helpers |
| `design-tokens.ts` | OKLCH palette constants |
| `utils.ts` | `cn()` classname helper |
| `uuid.ts` | `isUuid()` for materialised set log ids |
| `supabase/client.ts` | Browser Supabase client |
| `supabase/server.ts` | Server Component / Server Action client |
| `supabase/middleware.ts` | Session refresh in `proxy.ts` — **do not add logic between `createServerClient` and `getUser()`** |

Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Local setup: `supabase/LOCAL-DEV.md`.

## Progress rules

- Set completed = checkbox checked
- Daily progress = `completedSets / totalSets` for selected day
- Helpers: `getCompletedSets`, `getTotalSets`, `getExerciseProgress`

## Related

- `docs/DOMAIN.md`
- `.cursor/skills/fittrack-domain/SKILL.md`
