# Testing — FitTrack

## Unit tests today

Current suites live next to **pure logic** (parsers, mappers, progress helpers). They do **not** render React UI or assert visible copy.

| Area                          | Literal strings in tests               | i18n risk                                     |
| ----------------------------- | -------------------------------------- | --------------------------------------------- |
| `parsePrescription`           | `3x12`, `4×10`                         | None — prescription notation, not UI          |
| `normaliseExcelHeaders`       | `EXERCISE`, `EJERCICIO`, `SETS x REPS` | None — Excel column aliases for import        |
| `parseSheetName`              | `Day 1 - FULL BODY`                    | None — user workbook content                  |
| `mock-data` / `routineMapper` | Fixture names (`Hip Thrust`, etc.)     | None — sample **data**, not translated labels |

When the app gets i18n, these tests should stay as-is.

## Component & E2E tests (future)

Avoid asserting **translated UI strings** (`getByText("Complete")`, `toHaveTextContent("Sets")`, etc.). Prefer:

1. **`data-testid`** — stable hooks for behavior (`data-testid="set-row-checkbox"`).
2. **Roles + accessible names from fixtures** — only when the name is fixed test data, not a translation key output.
3. **State / DOM structure** — `checkbox` checked, `progressbar` `aria-valuenow`, input `value`.
4. **`getByRole`** with labels that come from **test-only** `aria-label` constants shared with components (not from locale files).

### When i18n lands

- Wrap component tests in a test provider with a **fixed locale** (e.g. `en`) **or** mock `t()` to return the key (`t("workout.complete")` → `"workout.complete"`).
- Assert **keys or test ids**, not copy in multiple languages.
- E2E: one canonical locale in CI; optional matrix job for `es` later.

### Helpers

- `test/render.tsx` — use for RTL tests; extend with the i18n provider when added.
- `test/mocks/next-navigation.ts` — Next.js router mock.

## Commands

```bash
pnpm test        # watch
pnpm test:run    # CI
pnpm test:coverage
```
