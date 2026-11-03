import type { EditorExercise, EditorSetInput } from "./editorTypes";
import { formatReps, parseRepsInput, type PlannedSet } from "./sets";
import { kgToInput, MAX_WEIGHT_KG, parseLoad } from "./weight";

export type EditorSetRow = EditorSetInput & { id: string };

/** Stable across re-renders of the same exercise so inputs keep focus while typing. */
function stableSetRowId(exerciseId: string, index: number): string {
  return `${exerciseId}-set-${index}`;
}

export function plannedToEditorSets(sets: PlannedSet[]): EditorSetInput[] {
  return sets.map((set) => ({
    setType: set.setType,
    reps: formatReps(set.repsMin, set.repsMax) ?? "",
    weightKg: kgToInput(set.weightKg),
  }));
}

export type EditorSetIssue = {
  index: number;
  field: "reps" | "weightKg";
  message: string;
};

function parseWeightInput(raw: string): number | null | "invalid" {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d+(?:[.,]\d+)?\s*(?:kg)?$/i.test(trimmed)) return "invalid";
  const kg = parseLoad(trimmed).kg;
  return kg === null || kg > MAX_WEIGHT_KG ? "invalid" : kg;
}

export function validateEditorSets(sets: EditorSetInput[]): EditorSetIssue[] {
  const issues: EditorSetIssue[] = [];
  sets.forEach((set, index) => {
    // Empty reps = not set yet (timed sets, legacy "3" set counts).
    if (set.reps.trim() !== "" && !parseRepsInput(set.reps)) {
      issues.push({
        index,
        field: "reps",
        message: `Set ${index + 1}: enter reps like 12 or 8-10`,
      });
    }
    if (parseWeightInput(set.weightKg) === "invalid") {
      issues.push({
        index,
        field: "weightKg",
        message: `Set ${index + 1}: enter kg as a number, like 20 or 7.5`,
      });
    }
  });
  return issues;
}

/** Converts editor inputs to numeric sets. Unreadable values become null. */
export function editorSetsToPlanned(sets: EditorSetInput[]): PlannedSet[] {
  return sets.map((set) => {
    const reps = parseRepsInput(set.reps);
    const weight = parseWeightInput(set.weightKg);
    return {
      setType: set.setType,
      repsMin: reps?.repsMin ?? null,
      repsMax: reps?.repsMax ?? null,
      weightKg: weight === "invalid" ? null : weight,
    };
  });
}

export function exerciseToSetRows(
  exercise: Pick<EditorExercise, "id" | "sets">
): EditorSetRow[] {
  return exercise.sets.map((set, index) => ({
    ...set,
    id: stableSetRowId(exercise.id, index),
  }));
}

function stripRowId({ setType, reps, weightKg }: EditorSetRow): EditorSetInput {
  return { setType, reps, weightKg };
}

export function setRowsToExercisePatch(
  rows: EditorSetRow[]
): Pick<EditorExercise, "sets"> {
  return { sets: rows.map(stripRowId) };
}

export function defaultSetRow(from?: EditorSetInput): EditorSetInput {
  return {
    setType:
      from?.setType === "warmup" ? "working" : (from?.setType ?? "working"),
    reps: from?.reps?.trim() ? from.reps : "12",
    weightKg: from?.weightKg ?? "",
  };
}

export function updateEditorSetRow(
  rows: EditorSetRow[],
  index: number,
  patch: Partial<EditorSetInput>
): EditorSetRow[] {
  return rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
}

export function addEditorSetRow(rows: EditorSetRow[]): EditorSetRow[] {
  return [
    ...rows,
    { ...defaultSetRow(rows[rows.length - 1]), id: `new-${rows.length}` },
  ];
}

export function removeEditorSetRow(
  rows: EditorSetRow[],
  index: number
): EditorSetRow[] {
  if (rows.length <= 1) {
    return [{ id: "new-0", setType: "working", reps: "", weightKg: "" }];
  }
  return rows.filter((_, i) => i !== index);
}
