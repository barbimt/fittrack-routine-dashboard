# Supabase

| File / folder | Purpose |
|---------------|---------|
| [schema.sql](./schema.sql) | Full schema (manual cloud install) |
| [migrations/](./migrations/) | Applied automatically on `pnpm supabase:reset` |
| [env.local.example](./env.local.example) | Template for `.env.local` (local keys + Google OAuth notes) |
| [reset-workout-sessions.sql](./reset-workout-sessions.sql) | Clear set logs and sessions; keep routines |
| [reset-user-data.sql](./reset-user-data.sql) | Clear one user's routines and sessions |
| [config.toml](./config.toml) | Supabase CLI project config (incl. Google provider) |

## Local Google OAuth

1. Create a **Web application** OAuth client in [Google Cloud Console](https://console.cloud.google.com/auth/clients).
2. Authorized JavaScript origins: `http://localhost:3000` (and `http://127.0.0.1:3000` if you use that host).
3. Authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback` (Supabase Auth callback, not the Next.js app).
4. Put Client ID and Secret in the environment used by the Supabase CLI (often a project-root `.env`):

```bash
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=...
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=...
```

5. Restart local stack: `pnpm supabase:stop && pnpm supabase:start`.
6. App callback stays at `/auth/callback` (already allow-listed in `config.toml`).

Without these env vars, email/password auth still works; the Google button will fail until the provider is configured.

For hosted Supabase, enable Google under Dashboard → Auth → Providers and set the same Client ID/Secret there.
