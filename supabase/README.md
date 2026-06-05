# Supabase — FitTrack

| File / folder | Purpose |
|---------------|---------|
| [LOCAL-DEV.md](./LOCAL-DEV.md) | **Start here** — Docker local setup, env vars, daily commands |
| [schema.sql](./schema.sql) | Full schema (manual cloud install) |
| [migrations/](./migrations/) | Applied automatically on `pnpm supabase:reset` |
| [env.local.example](./env.local.example) | Template for `.env.local` (local keys) |
| [reset-workout-sessions.sql](./reset-workout-sessions.sql) | Clear sets/saves; keep routines |
| [reset-user-data.sql](./reset-user-data.sql) | Clear one user’s routines + sessions |
| [seed.sql](./seed.sql) | Optional seed on `db reset` (empty by default) |
| [config.toml](./config.toml) | Supabase CLI project config |

## Quick commands (from repo root)

```bash
pnpm supabase:start
pnpm supabase:reset
pnpm supabase:status -o env | grep ANON_KEY
```

## Keys

Next.js needs **`ANON_KEY`** (JWT from `supabase status -o env`), not the **Publishable** key shown in the default status table.
