# Layout

Navigation chrome shared across all authenticated screens.

## Files

| File | Role |
|------|------|
| `sidebar.tsx` | Desktop nav (`lg+`), mobile drawer content, `navItems` export |
| `header.tsx` | Mobile top bar + hamburger menu trigger (`lg:hidden`) |

## Adding a route

1. Create `app/{route}/page.tsx`
2. Add entry to `navItems` in `sidebar.tsx`

## Related

- `components/app-shell.tsx` composes sidebar + header (mobile drawer)
