# Layout

Navigation chrome shared across all authenticated screens.

## Files

| File | Role |
|------|------|
| `sidebar.tsx` | Desktop nav (`lg+`), mobile drawer content, `navItems` export (single source of routes) |
| `header.tsx` | Mobile top bar + hamburger menu trigger (`lg:hidden`) |
| `mobile-nav-drawer.tsx` | Mobile overlay + slide-in drawer; reuses `Sidebar` |
| `page-content.tsx` | Shared page padding/max-width wrapper for routes inside `AppShell` |

## Adding a route

1. Create `app/{route}/page.tsx` wrapped in `<AppShell>`
2. Use `<PageContent width="…">` for standard padding (or pass `className` for one-offs)
3. Add entry to `navItems` in `sidebar.tsx` — appears in desktop sidebar and mobile drawer

## Related

- `components/app-shell.tsx` composes sidebar, drawer, header, and optional `PageContent` aside layout
