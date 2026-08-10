# FitTrack — documentation

Product docs for contributors and agents. Keep them aligned with the codebase whenever related code changes.

Learning notes under `docs/next/`, `docs/react/`, `docs/supabase/`, `docs/typescript/`, and `docs/CURSOR.md` stay **local** (gitignored). Cursor rules/skills live under `.cursor/` (also gitignored).

## Index

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, layering, data flow |
| [DOMAIN.md](./DOMAIN.md) | Dashboard entities + import types |
| [ROUTINE-IMPORT.md](./ROUTINE-IMPORT.md) | Excel parser, `/upload`, `features/routine-import/` |
| [ROADMAP.md](./ROADMAP.md) | Phases and checklists |

## When to update which doc

| You change… | Update… |
|-------------|---------|
| `features/routine-import/*` | `ROUTINE-IMPORT.md`, `DOMAIN.md` (import section), `ROADMAP.md`, `features/AGENTS.md` |
| Routine editor (`/editor`, editor hooks, dnd) | `ARCHITECTURE.md` (editor flow), `ROADMAP.md`, `features/AGENTS.md`, `components/fitness/AGENTS.md` |
| Session / set logging on `/` | `ARCHITECTURE.md` (dashboard flow), `ROADMAP.md`, `features/AGENTS.md` |
| `lib/mock-data.ts` types or progress rules | `DOMAIN.md`, root `AGENTS.md`, `lib/AGENTS.md` |
| New route or user-facing feature | Root `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `app/AGENTS.md` |
| Finished roadmap item | `ROADMAP.md` checkboxes |

**Style:** Describe the current system only. Replace obsolete sections; do not keep “historical” comparisons.
