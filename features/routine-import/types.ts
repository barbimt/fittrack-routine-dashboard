export type ImportWarningType =
  | "missing_column"
  | "unparsed_prescription"
  | "empty_sheet"
  | "skipped_row";

export type ImportWarning = {
  type: ImportWarningType;
  sheetName?: string;
  rowNumber?: number;
  message: string;
};

export type ParsedRoutineExercise = {
  name: string;
  prescription: string;
  plannedSets: number | null;
  targetReps: string | null;
  weight: string | null;
  notes: string | null;
  sortOrder: number;
};

export type ParsedRoutineDay = {
  originalName: string;
  name: string;
  focus: string | null;
  sortOrder: number;
  exercises: ParsedRoutineExercise[];
};

export type ParsedRoutine = {
  name: string;
  source: "excel";
  days: ParsedRoutineDay[];
  warnings: ImportWarning[];
};

export type CanonicalColumn = "EXERCISE" | "SETS_X_REPS" | "WEIGHT" | "NOTES";

export const REQUIRED_COLUMNS: CanonicalColumn[] = ["EXERCISE", "SETS_X_REPS"];

export const OPTIONAL_COLUMNS: CanonicalColumn[] = ["WEIGHT", "NOTES"];

export const COLUMN_LABELS: Record<CanonicalColumn, string> = {
  EXERCISE: "EXERCISE",
  SETS_X_REPS: "SETS x REPS",
  WEIGHT: "WEIGHT",
  NOTES: "NOTES",
};

export type ParseWorkbookSuccess = {
  ok: true;
  routine: ParsedRoutine;
};

export type ParseWorkbookFailure = {
  ok: false;
  error: string;
  warnings: ImportWarning[];
};

export type ParseWorkbookResult = ParseWorkbookSuccess | ParseWorkbookFailure;
