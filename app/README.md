# App routes (Next.js App Router)

One `page.tsx` per screen. See `AGENTS.md` for the route list.

## Routes

| Path | File | Data source |
|------|------|-------------|
| `/` | `page.tsx` | Supabase active routine + session; renders `DashboardClient` |
| `/login`, `/signup` | `login/page.tsx`, `signup/page.tsx` | Auth forms → `features/auth` |
| `/upload` | `upload/page.tsx` | Excel import UI → `features/routine-import` |
| `/empty` | `empty/page.tsx` | No active routine state |
| `/week`, `/progress`, `/editor` | mock prototypes | `lib/mock-data.ts` |
| `/settings` | `settings/page.tsx` | Placeholder UI |
| `/auth/callback` | `auth/callback/route.ts` | Supabase OAuth code exchange |

## Patterns

- Wrap main screens in `<AppShell>` from `@/components/app-shell`
- `"use client"` only when hooks, events, or browser APIs are needed
- Server Components for Supabase reads on `/` (auth + routine fetch)
- Content width: `max-w-4xl` or `max-w-5xl`, `pb-24` on mobile for bottom nav

## Home page flow (`/`)

1. `getUser()` → redirect `/login` if missing
2. Load active `routines` with nested days/exercises → redirect `/empty` if none
3. `getOrCreateDaySession` for first day → merge set logs into `TrainingDay[]`
4. Pass to `DashboardClient`
