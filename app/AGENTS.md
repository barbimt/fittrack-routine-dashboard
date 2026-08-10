# App routes

One `page.tsx` per screen under `app/{route}/`. Prefer Server Components when loading Supabase data; use Client Components for interactive UI.

## Auth vs public

Public paths (see `lib/supabase/middleware.ts`): `/login`, `/signup`, `/auth/*`, `/demo`, `/preview`, `/week`, `/progress`. Everything else requires a signed-in user.

## Routes

| Route | Data | Notes |
|-------|------|-------|
| `/` | Supabase active routine + day session | Redirect `/login` or `/empty` when needed; `DashboardClient` |
| `/login`, `/signup` | Auth forms | Redirect to `/` if already signed in |
| `/upload` | Client parse + `saveRoutine` | Excel import |
| `/editor` | Supabase active routine | `RoutineEditorClient`; saves via `updateRoutine` |
| `/empty` | None | CTA when no active routine |
| `/demo` | `lib/mock-data` | Public sample; `/preview` redirects here |
| `/week` | Mock | Not wired to sessions |
| `/progress` | Mock | Not wired to sessions |
| `/settings` | UI only | Not persisted |

## Shell

Wrap main screens in `<AppShell>` from `@/components/app-shell`. Add new nav entries in `components/layout/sidebar.tsx`.

## Local Supabase

Use `pnpm supabase:start` / `pnpm supabase:reset`. Env from `supabase/env.local.example` → `.env.local`. See `supabase/README.md`.
