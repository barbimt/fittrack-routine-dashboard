import type { WorkBook, WorkSheet } from "xlsx";
import type {
  CanonicalColumn,
  ImportWarning,
  ParsedRoutine,
  ParsedRoutineDay,
  ParsedRoutineExercise,
  ParseWorkbookResult,
} from "../types";
import {
  COLUMN_LABELS,
  MAX_IMPORT_FILE_BYTES,
  OPTIONAL_COLUMNS,
  REQUIRED_COLUMNS,
} from "../types";
import { getCell, isRowEmpty, mapHeaderRow } from "./normaliseExcelHeaders";
import { parseExerciseRow, type ExerciseRowCells } from "./parseExerciseRow";
import { parseSheetName } from "./parseSheetName";

type SheetUtils = typeof import("xlsx").utils;

const REQUIRED_LABELS = REQUIRED_COLUMNS.map((col) => COLUMN_LABELS[col]).join(
  ", "
);

/** Template helper tabs, never routine days. */
const IGNORED_SHEET = /^(how to|instructions?|example|ejemplo|c[oó]mo|guide|gu[ií]a)\b/i;

const ALL_COLUMNS: CanonicalColumn[] = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

export function isIgnoredSheetName(sheetName: string): boolean {
  return IGNORED_SHEET.test(sheetName.trim());
}

function routineNameFromFileName(fileName: string): string {
  const base = fileName.replace(/\.xlsx$/i, "").trim();
  if (!base) return "Imported routine";
  const words = base.replace(/[-_]+/g, " ").split(/\s+/);
  const titled = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  if (/^routine\b/i.test(titled)) return titled;
  return `Routine ${titled}`;
}

function parseSheet(
  utils: SheetUtils,
  sheetName: string,
  sheet: WorkSheet,
  daySortOrder: number,
  warnings: ImportWarning[]
): ParsedRoutineDay | null {
  // raw: true keeps numbers as typed (7.5 stays 7.5, not a locale string "7,5").
  const rows = utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
    blankrows: false,
  });

  if (rows.length === 0) {
    warnings.push({
      type: "empty_sheet",
      sheetName,
      message: `Tab "${sheetName}" is empty, so we skipped it.`,
    });
    return null;
  }

  const headerRowIndex = rows.findIndex((row) => {
    const { map } = mapHeaderRow(row);
    return REQUIRED_COLUMNS.every((column) => map[column] !== undefined);
  });

  if (headerRowIndex === -1) {
    warnings.push({
      type: "missing_column",
      sheetName,
      message: `Tab "${sheetName}" was skipped: add the columns ${REQUIRED_LABELS} in the first row.`,
    });
    return null;
  }

  const { map: headerMap } = mapHeaderRow(rows[headerRowIndex]);
  const { name, focus } = parseSheetName(sheetName);
  const exercises: ParsedRoutineExercise[] = [];

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const rowNumber = rowIndex + 1;
    if (isRowEmpty(row)) continue;

    const cells: ExerciseRowCells = {};
    for (const column of ALL_COLUMNS) {
      cells[column] = getCell(row, headerMap[column]);
    }

    if (!cells.EXERCISE) {
      warnings.push({
        type: "skipped_row",
        sheetName,
        rowNumber,
        column: COLUMN_LABELS.EXERCISE,
        message: `Row ${rowNumber} in "${sheetName}" was skipped: the exercise name is empty.`,
      });
      continue;
    }

    if (!cells.SETS_X_REPS) {
      warnings.push({
        type: "skipped_row",
        sheetName,
        rowNumber,
        column: COLUMN_LABELS.SETS_X_REPS,
        exerciseName: cells.EXERCISE,
        message: `${cells.EXERCISE} (row ${rowNumber}) was skipped: write the sets, like 3x12.`,
      });
      continue;
    }

    const parsed = parseExerciseRow(cells, {
      sheetName,
      rowNumber,
      sortOrder: exercises.length + 1,
    });
    exercises.push(parsed.exercise);
    warnings.push(...parsed.warnings);
  }

  if (exercises.length === 0) {
    warnings.push({
      type: "empty_sheet",
      sheetName,
      message: `Tab "${sheetName}" has no exercises, so we skipped it.`,
    });
    return null;
  }

  return {
    originalName: sheetName,
    name,
    focus,
    sortOrder: daySortOrder,
    exercises,
  };
}

export async function parseRoutineWorkbook(
  file: File
): Promise<ParseWorkbookResult> {
  const warnings: ImportWarning[] = [];

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return {
      ok: false,
      error: "This is not an Excel file. Upload a .xlsx file.",
      warnings,
    };
  }

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return {
      ok: false,
      error: "The file is too big (max 2 MB). Remove extra tabs or images and try again.",
      warnings,
    };
  }

  let workbook: WorkBook;
  let utils: SheetUtils;
  try {
    const XLSX = await import("xlsx");
    utils = XLSX.utils;
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: "array", dense: true });
  } catch {
    return {
      ok: false,
      error: "We could not open this file. Save it again as .xlsx and retry.",
      warnings,
    };
  }

  const sheetProps = workbook.Workbook?.Sheets ?? [];
  const dayNames = workbook.SheetNames.filter(
    (sheetName, index) =>
      !isIgnoredSheetName(sheetName) && !sheetProps[index]?.Hidden
  );

  if (dayNames.length === 0) {
    return {
      ok: false,
      error: "The file has no day tabs. Add one tab per training day.",
      warnings,
    };
  }

  const days: ParsedRoutineDay[] = [];
  for (const sheetName of dayNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const day = parseSheet(utils, sheetName, sheet, days.length + 1, warnings);
    if (day) days.push(day);
  }

  if (days.length === 0) {
    return {
      ok: false,
      error: `We found no exercises. Each day tab needs the columns ${REQUIRED_LABELS}.`,
      warnings,
    };
  }

  const routine: ParsedRoutine = {
    name: routineNameFromFileName(file.name),
    source: "excel",
    days,
    warnings,
  };

  return { ok: true, routine };
}
