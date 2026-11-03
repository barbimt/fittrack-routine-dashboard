import type { MuscleGroup } from "@/features/routines/muscleGroups";
import type { PlannedSet } from "@/features/routines/sets";

export type ImportWarningType =
  | "missing_column"
  | "unparsed_prescription"
  | "unknown_muscle"
  | "unparsed_value"
  | "empty_sheet"
  | "skipped_row";

export type ImportWarning = {
  type: ImportWarningType;
  sheetName?: string;
  rowNumber?: number;
  column?: string;
  value?: string;
  exerciseName?: string;
  message: string;
};

export type ParsedRoutineExercise = {
  name: string;
  /** Original SETS x REPS text from the file. */
  prescription: string;
  sets: PlannedSet[];
  muscleGroup: MuscleGroup | null;
  secondaryMuscles: MuscleGroup[];
  restTime: string | null;
  notes: string | null;
  sortOrder: number;
  /** Short messages shown next to the exercise in the preview. */
  warnings: string[];
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

export type CanonicalColumn =
  | "EXERCISE"
  | "SETS_X_REPS"
  | "WEIGHT"
  | "MUSCLE"
  | "SECONDARY"
  | "REST"
  | "NOTES";

export const REQUIRED_COLUMNS: CanonicalColumn[] = ["EXERCISE", "SETS_X_REPS"];

export const OPTIONAL_COLUMNS: CanonicalColumn[] = [
  "WEIGHT",
  "MUSCLE",
  "SECONDARY",
  "REST",
  "NOTES",
];

export const COLUMN_LABELS: Record<CanonicalColumn, string> = {
  EXERCISE: "EXERCISE",
  SETS_X_REPS: "SETS x REPS",
  WEIGHT: "WEIGHT (kg)",
  MUSCLE: "MUSCLE",
  SECONDARY: "ALSO WORKS",
  REST: "REST (sec)",
  NOTES: "NOTES",
};

export const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;

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
