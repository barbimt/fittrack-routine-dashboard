# Routine import (Excel → Supabase)

Technical reference for `/upload` and `features/routine-import/`.

## Scope

| In scope | Out of scope |
|----------|----------------|
| Client-side `.xlsx` read and parse | Replacing dashboard `trainingDays` |
| `ParsedRoutine` preview in UI | `localStorage` persistence |
| Static template download | |
| Warnings (non-blocking) | |
| Save `ParsedRoutine` to Supabase (one row per planned set) | |

## Language

- App UI and templates: **English** (short, B2 level).
- Excel headers: `EXERCISE`, `SETS x REPS`, `WEIGHT (kg)`, `MUSCLE`, `ALSO WORKS`, `REST (sec)`, `NOTES`.
- Sheet names: `Day 1 - Legs` (split on first ` - ` into `name` + `focus`).
- Spanish headers (`EJERCICIO`, `SERIES x REPS`, `PESO`, `MUSCULO`, `GRUPO MUSCULAR`, `SECUNDARIOS`, `DESCANSO`, `NOTAS`) map via aliases in `normaliseExcelHeaders.ts`. Accents, parentheses, `*` and `:` are ignored when matching.

## Module layout

```
features/routine-import/
  types.ts                          # ParsedRoutine, ImportWarning, COLUMN_LABELS, MAX_IMPORT_FILE_BYTES
  schema.ts                         # zod importedRoutineSchema (server-side validation)
  template.ts                       # ROUTINE_TEMPLATE_URL / filename
  actions/
    saveRoutineAction.ts            # Server Action: ParsedRoutine → Supabase
  utils/
    parseRoutineWorkbook.ts         # File → ParseWorkbookResult (SheetJS, dynamic import)
    parseExerciseRow.ts             # One row → ParsedRoutineExercise + warnings
    normaliseExcelHeaders.ts        # Header row → column indices
    parsePrescription.ts            # "4x10", "1x12 15kg - 3x12 20kg", "W1x15", "3x30 sec"
    parseSheetName.ts               # Sheet title → name + focus
  components/
    RoutineImportForm.tsx           # idle → parsing → preview → saving → saved | error
    ImportPreview.tsx               # "Check your routine" summary + day cards
    ImportDayExercises.tsx          # Expandable exercise rows (sets table on open)
    PlannedSetsTable.tsx            # Read-only Set / Reps / Kg table with W / D badges
    FormatExample.tsx               # "How to write your sets" tabs (Excel row → app view)
    ImportWarnings.tsx              # File-level "Skipped" list
tools/
  generate-routine-template.ts      # pnpm template:generate → public/templates/*.xlsx
  backfill-exercise-sets.ts         # pnpm db:backfill-sets [--apply]
```

## `/upload` page

- Header "Import your routine" + 3 steps: get the template, write your exercises, upload and check.
- **Download template** — static file `public/templates/fittrack-routine-template.xlsx` (`<a download>`).
- "No Excel? Build it in the app" → `/editor`.
- `RoutineImportForm` — always shows `UploadDropzone`; Import button is sticky at the bottom on mobile.
- "How to write your sets" (`<details>`) — open on first visit, closed afterwards (`localStorage` key `fittrack:upload-guide-seen`). Each example is parsed with the real parser, so the guide cannot drift from the importer.

## File input

- `.xlsx` only, max 2 MB. Invalid files are rejected by the form with a short message.
- Reset input value after each pick so the same file can be re-selected.
- SheetJS is loaded with `import("xlsx")` only when a file is picked.

## Spreadsheet format

**One sheet = one training day.** First row with both required headers = header row. Rows below = exercises.

Ignored sheets: hidden sheets, and tabs named `How to`, `Example`, or `Lists`.

| Column | Required | Maps to |
|--------|----------|---------|
| EXERCISE | Yes | `name` |
| SETS x REPS | Yes | `sets` (one `PlannedSet` per set) + display `prescription` |
| WEIGHT (kg) | No | default `weightKg` for sets without their own kg |
| MUSCLE | No | `muscleGroup` (slug); extra muscles become secondary |
| ALSO WORKS | No | `secondaryMuscles` (slugs) |
| REST (sec) | No | `restTime` |
| NOTES | No | `notes` (unparsed leftovers are merged in) |

### SETS x REPS syntax

| Cell | Result |
|------|--------|
| `4x10` | 4 working sets × 10 reps |
| `3x8-10` | 3 sets, rep range 8–10 |
| `1x12 15kg - 3x12 20kg` | 1 set at 15 kg, then 3 sets at 20 kg |
| `W1x15 20kg - 3x8 60kg` | 1 warm-up set, then 3 working sets |
| `D1x12` | drop set |
| `3` | 3 sets, reps not set |
| `3x30 sec` | 3 sets, reps not set, "30 sec" added to notes |

Unreadable cells never drop the exercise: it gets 1 empty set, the text goes to notes, and the row shows a warning.

## Types (`types.ts`)

```ts
ParsedRoutineExercise = {
  name: string;
  prescription: string;        // display string built from sets
  sets: PlannedSet[];          // { setType: "warmup" | "working" | "drop", repsMin, repsMax, weightKg }
  muscleGroup: string | null;  // slug
  secondaryMuscles: string[];  // slugs
  restTime: number | null;     // seconds
  notes: string | null;
  sortOrder: number;
  warnings: string[];          // row-level, shown inline in the preview
}

ImportWarning = {
  type: "missing_column" | "unparsed_prescription" | "empty_sheet" | "skipped_row"
      | "unknown_muscle" | "unparsed_value";
  sheetName?: string;
  rowNumber?: number;
  column?: string;
  value?: string;
  exerciseName?: string;
  message: string;
}
```

## Warnings vs errors

| Kind | Blocks preview? | Example |
|------|-----------------|--------|
| Error | Yes | Invalid extension, file over 2 MB, unreadable file, no valid days |
| Warning | No | Optional column missing, unparsed SETS x REPS, non-numeric WEIGHT, unknown muscle, empty sheet |

## Template

Generated with ExcelJS by `pnpm template:generate` (commit the output). Tabs: `How to`, hidden `Lists` (muscle dropdown source), `Day 1 - Legs`, `Day 2 - Upper`, `Day 3`. Data validation: kg 0–1000 decimal, muscle dropdown, rest 0–900 whole number. SETS x REPS is text-formatted so Excel does not turn `3-10` into a date.

## Save flow (`saveRoutineAction.ts`)

1. Validates the payload with `importedRoutineSchema` (zod) and sanitizes muscle slugs.
2. Reads `user_id` from the Supabase session.
3. `insertActiveRoutineTree`: replaces a routine with the same name, deactivates other active routines, inserts routine → days → exercises → `routine_exercise_sets`.
4. Returns `{ ok: true, routineId, dayCount, exerciseCount }` or `{ ok: false, error }`.

`routine_exercise_sets` is the source of truth. `prescription`, `planned_sets`, `target_reps` and `weight` on `routine_exercises` are still written (derived) for older readers.

## Legacy data backfill

`pnpm db:backfill-sets` (dry run) / `pnpm db:backfill-sets --apply`. Needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Skips exercises that already have set rows, so it is safe to re-run.

## Maintenance checklist

When editing import code, update this file if you change:

- Column names or aliases
- SETS x REPS syntax
- `ParsedRoutine` shape
- Warning types or messages
- Template tabs or filename (re-run `pnpm template:generate`)
- Save/persistence contract
