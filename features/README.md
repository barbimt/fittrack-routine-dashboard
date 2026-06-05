# Features

Domain logic grouped by capability: auth, routine import, live routines/sessions. Each subfolder has its own `README.md`.

## Structure

| Folder | Responsibility |
|--------|----------------|
| [`auth/`](./auth/README.md) | Login, signup, logout (Server Actions + forms) |
| [`routine-import/`](./routine-import/README.md) | Excel parse, preview, save to Supabase |
| [`routines/`](./routines/README.md) | DB types, mapper, workout session/set actions |

## Conventions

- Server Actions in `actions/` with `"use server"`
- Pure utils (parsers, mappers) stay free of React
- Types mirror `supabase/schema.sql` where applicable
- Result types: `{ ok: true; … } | { ok: false; error: string }`

## Related docs

- `docs/ROUTINE-IMPORT.md` — Excel format and parser
- `docs/DOMAIN.md` — entity types
- `supabase/schema.sql` — source of truth for DB shape
