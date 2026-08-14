# FitTrack — documentation

Update these when the related code changes.

Learning notes under `docs/next/`, `docs/react/`, `docs/supabase/`, and `docs/typescript/` stay local (gitignored).

## Index

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, layering, data flow |
| [DOMAIN.md](./DOMAIN.md) | Dashboard entities + import types |
| [ROUTINE-IMPORT.md](./ROUTINE-IMPORT.md) | Excel parser, `/upload`, `features/routine-import/` |
| [FEATURES.md](./FEATURES.md) | Product feature catalog / env release flags |
| [ROADMAP.md](./ROADMAP.md) | Phases and checklists |

## When to update which doc

| You change… | Update… |
|-------------|---------|
| `features/routine-import/*` | `ROUTINE-IMPORT.md`, `DOMAIN.md` (import section), `ROADMAP.md` |
| Routine editor (`/editor`, editor hooks, dnd) | `ARCHITECTURE.md` (editor flow), `ROADMAP.md` |
| Session / set logging on `/` | `ARCHITECTURE.md` (dashboard flow), `ROADMAP.md` |
| `lib/mock-data.ts` types or progress rules | `DOMAIN.md` |
| New route or user-facing feature | Root `README.md`, `ARCHITECTURE.md` |
| Finished roadmap item | `ROADMAP.md` checkboxes |

Describe the current system only. Replace obsolete sections instead of keeping historical comparisons.
