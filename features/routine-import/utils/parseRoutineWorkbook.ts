import * as XLSX from "xlsx";
import type {
  ImportWarning,
  ParsedRoutine,
  ParsedRoutineDay,
  ParsedRoutineExercise,
  ParseWorkbookResult,
} from "../types";
import { COLUMN_LABELS, OPTIONAL_COLUMNS, REQUIRED_COLUMNS } from "../types";
import { getCell, isRowEmpty, mapHeaderRow } from "./normaliseExcelHeaders";
import { parsePrescription } from "./parsePrescription";
import { parseSheetName } from "./parseSheetName";

const REQUIRED_LABELS = REQUIRED_COLUMNS.map((col) => COLUMN_LABELS[col]).join(
  ", "
);

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
  sheetName: string,
  sheet: XLSX.WorkSheet,
  daySortOrder: number,
  warnings: ImportWarning[]
): ParsedRoutineDay | null {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (rows.length === 0) {
    warnings.push({
      type: "empty_sheet",
      sheetName,
      message: `Sheet "${sheetName}" is empty.`,
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
      message: `Sheet "${sheetName}" is missing required columns: ${REQUIRED_LABELS}.`,
    });
    return null;
  }

  const { map: headerMap } = mapHeaderRow(rows[headerRowIndex]);

  for (const column of OPTIONAL_COLUMNS) {
    if (headerMap[column] === undefined) {
      warnings.push({
        type: "missing_column",
        sheetName,
        message: `Sheet "${sheetName}": optional column ${COLUMN_LABELS[column]} not found.`,
      });
    }
  }

  const { name, focus } = parseSheetName(sheetName);
  const exercises: ParsedRoutineExercise[] = [];
  let exerciseSortOrder = 0;

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const excelRowNumber = rowIndex + 1;

    if (isRowEmpty(row)) continue;

    const exerciseName = getCell(row, headerMap.EXERCISE);
    if (!exerciseName) {
      warnings.push({
        type: "skipped_row",
        sheetName,
        rowNumber: excelRowNumber,
        message: `Row ${excelRowNumber} in "${sheetName}" skipped: missing ${COLUMN_LABELS.EXERCISE}.`,
      });
      continue;
    }

    const prescription = getCell(row, headerMap.SETS_X_REPS);
    if (!prescription) {
      warnings.push({
        type: "skipped_row",
        sheetName,
        rowNumber: excelRowNumber,
        message: `Row ${excelRowNumber} in "${sheetName}" skipped: missing ${COLUMN_LABELS.SETS_X_REPS}.`,
      });
      continue;
    }

    const parsedPrescription = parsePrescription(prescription);
    if (!parsedPrescription.parsed) {
      warnings.push({
        type: "unparsed_prescription",
        sheetName,
        rowNumber: excelRowNumber,
        message: `Row ${excelRowNumber} in "${sheetName}" (${exerciseName}): could not read sets/reps from "${prescription}". Use a format like 3x12 or 4x10. The exercise was still imported.`,
      });
    }

    exerciseSortOrder += 1;
    exercises.push({
      name: exerciseName,
      prescription,
      plannedSets: parsedPrescription.plannedSets,
      targetReps: parsedPrescription.targetReps,
      weight: getCell(row, headerMap.WEIGHT) || null,
      notes: getCell(row, headerMap.NOTES) || null,
      sortOrder: exerciseSortOrder,
    });
  }

  if (exercises.length === 0) {
    warnings.push({
      type: "empty_sheet",
      sheetName,
      message: `Sheet "${sheetName}" has no valid exercises.`,
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
      error: "Invalid file format. Please upload a .xlsx file.",
      warnings,
    };
  }

  let workbook: XLSX.WorkBook;
  try {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    return {
      ok: false,
      error:
        "Could not read the Excel file. Check that it is a valid .xlsx workbook.",
      warnings,
    };
  }

  if (workbook.SheetNames.length === 0) {
    return {
      ok: false,
      error: "The workbook has no sheets.",
      warnings,
    };
  }

  const days: ParsedRoutineDay[] = [];

  workbook.SheetNames.forEach((sheetName, index) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    const day = parseSheet(sheetName, sheet, index + 1, warnings);
    if (day) days.push(day);
  });

  if (days.length === 0) {
    return {
      ok: false,
      error: `No routine days could be imported. Check sheet names, headers (${REQUIRED_LABELS}), and exercise rows.`,
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
