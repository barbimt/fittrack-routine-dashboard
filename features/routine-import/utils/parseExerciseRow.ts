import { mergeNotes } from "@/features/routines/exercisePlan";
import { parseMuscleList } from "@/features/routines/muscleGroups";
import { formatRestTime, parseRestTime } from "@/features/routines/restTime";
import type { PlannedSet } from "@/features/routines/sets";
import { parseLoad } from "@/features/routines/weight";
import type {
  CanonicalColumn,
  ImportWarning,
  ParsedRoutineExercise,
} from "../types";
import { COLUMN_LABELS } from "../types";
import { parsePrescriptionToSets } from "./parsePrescription";

export type ExerciseRowCells = Partial<Record<CanonicalColumn, string>>;

type RowContext = {
  sheetName: string;
  rowNumber: number;
  sortOrder: number;
};

export type ParsedExerciseRow = {
  exercise: ParsedRoutineExercise;
  warnings: ImportWarning[];
};

function parseRest(value: string): string | null | "invalid" {
  if (!value) return null;
  const { minutes, seconds } = parseRestTime(value);
  return formatRestTime(minutes, seconds) ?? "invalid";
}

/**
 * Turns one spreadsheet row into an exercise with one entry per set.
 * Never drops the exercise because of a bad optional cell: it keeps what it
 * can read and returns a warning that says which cell to fix.
 */
export function parseExerciseRow(
  cells: ExerciseRowCells,
  context: RowContext
): ParsedExerciseRow {
  const name = cells.EXERCISE?.trim() ?? "";
  const prescription = cells.SETS_X_REPS?.trim() ?? "";
  const weightCell = cells.WEIGHT?.trim() ?? "";
  const warnings: ImportWarning[] = [];
  const shortWarnings: string[] = [];

  const warn = (
    type: ImportWarning["type"],
    column: CanonicalColumn,
    value: string,
    short: string
  ) => {
    shortWarnings.push(short);
    warnings.push({
      type,
      sheetName: context.sheetName,
      rowNumber: context.rowNumber,
      column: COLUMN_LABELS[column],
      value,
      exerciseName: name,
      message: `${name} (row ${context.rowNumber}): ${short}`,
    });
  };

  const parsed = parsePrescriptionToSets(prescription, weightCell || null);
  const extraNotes = [...parsed.notes];
  let sets: PlannedSet[] = parsed.sets;

  if (!parsed.ok) {
    const fallbackKg = parseLoad(weightCell || null).kg;
    sets = [
      {
        setType: "working",
        repsMin: null,
        repsMax: null,
        weightKg: fallbackKg,
      },
    ];
    extraNotes.unshift(prescription);
    warn(
      "unparsed_prescription",
      "SETS_X_REPS",
      prescription,
      `could not read "${prescription}". We added 1 empty set — write it like 3x12 or fix it in the editor.`
    );
  } else if (parsed.unreadable.length > 0) {
    extraNotes.push(...parsed.unreadable);
    warn(
      "unparsed_prescription",
      "SETS_X_REPS",
      prescription,
      `part of "${prescription}" was not read (${parsed.unreadable.join(", ")}). We saved it in the notes.`
    );
  }

  if (
    weightCell &&
    parseLoad(weightCell).kg === null &&
    !/^(—|-|bw|bodyweight|peso corporal)$/i.test(weightCell)
  ) {
    warn(
      "unparsed_value",
      "WEIGHT",
      weightCell,
      `weight "${weightCell}" is not a number. Use kg only, like 20 or 7.5.`
    );
  }
  if (parsed.convertedFromLb) {
    shortWarnings.push("weight was in lb and is now in kg.");
  }

  const primaryList = parseMuscleList(cells.MUSCLE);
  const secondaryList = parseMuscleList(cells.SECONDARY);
  const unknownMuscles = [...primaryList.unknown, ...secondaryList.unknown];
  if (unknownMuscles.length > 0) {
    warn(
      "unknown_muscle",
      primaryList.unknown.length > 0 ? "MUSCLE" : "SECONDARY",
      unknownMuscles.join(", "),
      `muscle "${unknownMuscles.join(", ")}" is not in the list. Pick one from the dropdown in the template.`
    );
  }
  const [muscleGroup = null, ...extraPrimary] = primaryList.muscles;
  const secondaryMuscles = [
    ...new Set([...extraPrimary, ...secondaryList.muscles]),
  ].filter((slug) => slug !== muscleGroup);

  const restCell = cells.REST?.trim() ?? "";
  let restTime = parseRest(restCell);
  if (restTime === "invalid") {
    warn(
      "unparsed_value",
      "REST",
      restCell,
      `rest "${restCell}" is not a time. Use seconds, like 90.`
    );
    restTime = null;
  }

  return {
    exercise: {
      name,
      prescription,
      sets,
      muscleGroup,
      secondaryMuscles,
      restTime,
      notes: mergeNotes(cells.NOTES?.trim() || null, extraNotes),
      sortOrder: context.sortOrder,
      warnings: shortWarnings,
    },
    warnings,
  };
}
