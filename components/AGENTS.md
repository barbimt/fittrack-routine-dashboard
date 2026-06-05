# Components

UI building blocks for FitTrack. **No business logic or data fetching** in presentational components — pass props and callbacks from pages or `features/`.

## Structure

| Folder | Role |
|--------|------|
| `fitness/` | Workout UI: exercises, sets, progress, import dropzone — see `fitness/AGENTS.md` |
| `layout/` | App chrome: sidebar, header, mobile tabs — see `layout/AGENTS.md` |
| `ui/` | shadcn/Radix primitives — see `ui/AGENTS.md` |
| `app-shell.tsx` | Responsive shell template (`Sidebar` + `Header` + optional `aside`) |
| `theme-provider.tsx` | Dark/light theme wrapper |

## Import rules

- Workout screens → `components/fitness/*` (`Button`, `Input`, `Badge` for touch targets)
- Auth/settings forms → `components/ui/*` directly
- Every main route wraps content in `<AppShell>`

## Related

- `docs/ARCHITECTURE.md` — layering
- `.cursor/rules/fitness-components.mdc` — props and patterns
