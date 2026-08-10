# Routine import (Excel → Supabase)

Technical reference for `/upload` and `features/routine-import/`.

## Scope

| In scope | Out of scope |
|----------|----------------|
| Client-side `.xlsx` read and parse | Replacing dashboard `trainingDays` |
| `ParsedRoutine` preview in UI | `localStorage` persistence |
| Template download | |
| Warnings (non-blocking) | |
| Save `ParsedRoutine` to Supabase | |

## Language

- App UI and templates: **English**.
- Excel headers: `EXERCISE`, `SETS x REPS`, `WEIGHT`, `NOTES`.
- Sheet names: `Day 1 - FULL BODY` (split on first ` - ` into `name` + `focus`).
- Spanish headers (`EJERCICIO`, `SERIES x REPS`, `PESO`, `NOTAS`) map via aliases in `normaliseExcelHeaders.ts`.

## Module layout

```
features/routine-import/
  types.ts                          # ParsedRoutine, ImportWarning, COLUMN_LABELS
  actions/
    saveRoutineAction.ts            # Server Action: ParsedRoutine → Supabase
  utils/
    parseRoutineWorkbook.ts         # File → ParseWorkbookResult
    normaliseExcelHeaders.ts        # Header row → column indices
    parsePrescription.ts            # "4x10", compounds, × normalization
    parseSheetName.ts               # Sheet title → name + focus
    downloadRoutineTemplate.ts      # fittrack-routine-template.xlsx
  components/
    RoutineImportForm.tsx           # idle → parsing → preview → saving → saved | error
    ImportPreview.tsx               # Summary + day cards
    ImportDayExercises.tsx          # First 3 exercises + collapsible rest
    ImportWarnings.tsx              # Warning list (capped display)
```

## `/upload` page

- `app/upload/page.tsx` — `"use client"`, `AppShell`, static format card + checklist.
- `RoutineImportForm` — file flow, calls `parseRoutineWorkbook`, then `saveRoutine` on confirm.
- **Import routine** — active; calls `saveRoutineAction` and shows success state on completion.
- **Download template** — `downloadRoutineTemplate()`.

## Why Client Component

- `<input type="file">`, `File.arrayBuffer()`, SheetJS run in the browser.
- Preview state (`ParsedRoutine`) lives in React until a save step exists.

## File input

- Idle: `EmptyState` + hidden file input (`useId`).
- After select: `UploadDropzone` (drag/drop, change file).
- Reset input value after each pick so the same file can be re-selected.
- Accept: `.xlsx` only.

## Spreadsheet format

**One sheet = one training day.** Row 1 = headers. Rows 2+ = exercises.

| Column | Required | Maps to |
|--------|----------|---------|
| EXERCISE | Yes | `ParsedRoutineExercise.name` |
| SETS x REPS | Yes | `prescription` (raw string always stored) |
| WEIGHT | No | `weight` |
| NOTES | No | `notes` |

Skipped: completely empty rows; rows without EXERCISE; rows without SETS x REPS.

## Types (`types.ts`)

```ts
ParsedRoutine = {
  name: string;           // from filename, e.g. "Routine March 2026"
  source: "excel";
  days: ParsedRoutineDay[];
  warnings: ImportWarning[];
}

ParsedRoutineDay = {
  originalName: string;   // exact sheet name
  name: string;           // parsed short name
  focus: string | null;
  sortOrder: number;      // sheet order in workbook
  exercises: ParsedRoutineExercise[];
}

ParsedRoutineExercise = {
  name: string;
  prescription: string;
  plannedSets: number | null;
  targetReps: string | null;
  weight: string | null;
  notes: string | null;
  sortOrder: number;
}

ImportWarning = {
  type: "missing_column" | "unparsed_prescription" | "empty_sheet" | "skipped_row";
  sheetName?: string;
  rowNumber?: number;
  message: string;
}
```

## Parser pipeline

1. `parseRoutineWorkbook(file)` — extension check, `XLSX.read(arrayBuffer)`.
2. Per sheet: `sheet_to_json` with `header: 1`.
3. Find first row containing both required columns.
4. Optional columns → `missing_column` warning if absent (import continues).
5. Each valid row → `parsePrescription(prescription)` for derived fields.
6. If no days imported → `{ ok: false, error, warnings }`.

## `parsePrescription`

Input: raw SETS x REPS cell. Output: `{ plannedSets, targetReps, parsed }`.

- Normalizes Unicode multiply signs (`×`, `✕`) to ASCII `x` via `normalizePrescriptionInput`.
- Single block: `4x10`, `3 x 10`.
- Suffix kept: `3x10 per leg` → `targetReps: "10 per leg"`.
- Compound (split on `-`): `1x12 - 3x12` → sum sets (4); reps from last block if mixed.
- Failure: `plannedSets` / `targetReps` null + `unparsed_prescription` warning; exercise still imported.

## Preview UI

- Header: file name, size, day count, exercise count.
- Per day: title, exercise count, first **3** exercises.
- More than 3: `ImportDayExercises` collapsible — “Show N more exercises” / “Hide N more exercises” (`Collapsible` + chevron, `min-h-11` trigger).

## Warnings vs errors

| Kind | Blocks preview? | Example |
|------|-----------------|--------|
| Error | Yes | Invalid extension, unreadable file, no valid days |
| Warning | No | Optional column missing, unparsed prescription, empty sheet |

Warning copy includes exercise name when relevant and states the row was still imported.

## Template download

`downloadRoutineTemplate.ts` — workbook with sheets:

- `Day 1 - FULL BODY`
- `Day 2 - BACK + CHEST`
- `Day 3 - GLUTES`

Filename: `fittrack-routine-template.xlsx`.

## Save flow (`saveRoutineAction.ts`)

Server Action (`"use server"`). Called from `RoutineImportForm` after preview is confirmed.

1. Reads `user_id` from active Supabase session via `auth.getUser()`.
2. Deletes any existing routine with the same name for this user (idempotent reimport).
3. Deactivates any other `is_active = true` routine (enforces one active routine per user).
4. Inserts `routines` row with `is_active: true`.
5. For each day: inserts `routine_days` row, then batch-inserts `routine_exercises`.
6. Returns `{ ok: true, routineId, dayCount, exerciseCount }` or `{ ok: false, error }`.

Cascade FK setup in the schema means deleting a routine automatically removes all its days and exercises.

### Routine name from filename

`routineNameFromFileName(fileName)` title-cases the base name and prepends `"Routine "` unless the name already starts with that word (avoids `"Routine Routine …"`).

### Success state

On save, the form transitions to a `"saved"` phase showing day + exercise counts with links to "Go to dashboard" and "Import another".

## Dependency

- `xlsx` (SheetJS Community) — `pnpm add xlsx`
- Run `pnpm build` after non-trivial changes under `features/routine-import/`.

## Maintenance checklist

When editing import code, update this file if you change:

- Column names or aliases
- `ParsedRoutine` shape
- Warning types or messages
- Preview UI behavior (e.g. visible exercise count)
- Template sheets or filename
- Save/persistence contract
