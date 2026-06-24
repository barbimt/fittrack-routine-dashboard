# Routine import

Client-side Excel (`.xlsx`) parse and server-side save to Supabase.

## Layout

| Path | Role |
|------|------|
| `types.ts` | `ParsedRoutine`, column labels, sheet types |
| `utils/parseRoutineWorkbook.ts` | SheetJS entry — workbook → `ParsedRoutine` |
| `utils/parsePrescription.ts` | Rep/set string parsing |
| `utils/parseSheetName.ts` | Day name + focus from sheet tab |
| `utils/normaliseExcelHeaders.ts` | Header alias matching |
| `utils/downloadRoutineTemplate.ts` | Template `.xlsx` download |
| `actions/saveRoutineAction.ts` | `saveRoutine` Server Action |
| `components/RoutineImportForm.tsx` | Upload → preview → confirm |
| `components/ImportPreview.tsx` | Parsed routine summary |
| `components/ImportWarnings.tsx` | Parser warnings list |
| `components/ImportDayExercises.tsx` | Per-day exercise collapsible |

## Save flow (`saveRoutine`)

1. Delete existing routine with same name (cascade — idempotent reimport)
2. Deactivate other `is_active` routines (partial unique index: one active per user)
3. Insert `routines` → `routine_days` → `routine_exercises` in FK order

## Related

- `docs/ROUTINE-IMPORT.md`
- `app/upload/page.tsx`

## Spreadsheet columns

| Column | Required | Use |
|--------|----------|-----|
| EXERCISE | Yes | Exercise name |
| SETS x REPS | Yes | Full prescription — simple (`4x10`), variable reps (`3x10-2x8`), or reps+weight per block (`1x12 15kg-3x12 20kg`; `@` / `con` also OK) |
| WEIGHT | No | Same load for **all** sets; leave empty when weight is in SETS x REPS |
| NOTES | No | Coaching cues (not parsed) |

Separate prescription blocks with `-`. Spanish aliases: `SERIES x REPS`, `PESO`, etc.
