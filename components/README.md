# Components

UI building blocks for FitTrack. **No business logic or data fetching** in presentational components — pass props and callbacks from pages or `features/`.

## Structure

| Folder | Role |
|--------|------|
| [`fitness/`](./fitness/README.md) | Workout UI: exercises, sets, progress, import dropzone |
| [`layout/`](./layout/README.md) | App chrome: sidebar, header, mobile tabs |
| [`ui/`](./ui/README.md) | shadcn/Radix primitives — generic, not FitTrack-branded |
| `app-shell.tsx` | Responsive shell template (`Sidebar` + `Header` + optional `aside`) |
| `theme-provider.tsx` | Dark/light theme wrapper |

## Import rules

- Workout screens → `components/fitness/*` (`Button`, `Input`, `Badge` for touch targets)
- Auth/settings forms → `components/ui/*` directly
- Every main route wraps content in `<AppShell>`

## Related

- `docs/ARCHITECTURE.md` — layering
- `.cursor/rules/fitness-components.mdc` — props and patterns
