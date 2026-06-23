# Layout

Navigation chrome shared across all authenticated screens.

## Files

| File | Role |
|------|------|
| `sidebar.tsx` | Desktop nav (`lg+`), mobile drawer content, `navItems` export |
| `header.tsx` | Mobile top bar + menu trigger |
| `mobile-navigation.tsx` | Bottom tab bar (first 5 routes); in document flow on mobile (not `fixed`) |

## Adding a route

1. Create `app/{route}/page.tsx`
2. Add entry to `navItems` in `sidebar.tsx`
3. If it should appear in bottom tabs, keep total primary tabs ≤ 5

## Related

- `components/app-shell.tsx` composes all three
