import { expandPrescriptionToSets } from "@/features/routine-import/utils/parsePrescription";
import type { EditorExercise } from "./editorTypes";
import { buildPrescription } from "./prescription";

/** One editable set row in the routine editor (no schema change — maps to prescription). */
export type EditorSetRow = {
  /** Stable client id for list keys. */
  id: string;
  reps: string;
  /** Numeric weight without unit (UI shows KG; persisted as e.g. `60kg`). */
  weightKg: string;
};

function newSetRowId(): string {
  return crypto.randomUUID();
}

/** Stable across re-hydrates of the same exercise so inputs keep focus while typing. */
function stableSetRowId(exerciseId: string, index: number): string {
  return `${exerciseId}-set-${index}`;
}

export function stripWeightUnit(weight: string | null | undefined): string {
  if (!weight) return "";
  return weight.replace(/\s*kg\s*$/i, "").trim();
}

export function formatWeightKg(weightKg: string): string | null {
  const trimmed = weightKg.trim();
  if (!trimmed) return null;
  if (/kg$/i.test(trimmed)) return trimmed;
  return `${trimmed}kg`;
}

/**
 * Hydrate per-set editor rows from the existing exercise fields
 * (`prescription` / `plannedSets` / `targetReps` / `weight`).
 */
export function exerciseToSetRows(exercise: EditorExercise): EditorSetRow[] {
  const prescription = exercise.prescription?.trim();
  if (prescription && prescription !== "—") {
    const expanded = expandPrescriptionToSets(prescription, exercise.weight);
    if (expanded.length > 0) {
      return expanded.map((set, index) => ({
        id: stableSetRowId(exercise.id, index),
        reps: set.targetReps > 0 ? String(set.targetReps) : "",
        weightKg: stripWeightUnit(set.targetWeight),
      }));
    }
  }

  const count =
    exercise.plannedSets && exercise.plannedSets > 0 ? exercise.plannedSets : 1;
  const reps = exercise.targetReps?.trim() ?? "";
  const weightKg = stripWeightUnit(exercise.weight);

  return Array.from({ length: count }, (_, index) => ({
    id: stableSetRowId(exercise.id, index),
    reps,
    weightKg,
  }));
}

type SetBlock = { sets: number; reps: string; weightKg: string };

function groupSetRows(rows: EditorSetRow[]): SetBlock[] {
  const blocks: SetBlock[] = [];

  for (const row of rows) {
    const reps = row.reps.trim() || "0";
    const weightKg = row.weightKg.trim();
    const last = blocks[blocks.length - 1];
    if (last && last.reps === reps && last.weightKg === weightKg) {
      last.sets += 1;
    } else {
      blocks.push({ sets: 1, reps, weightKg });
    }
  }

  return blocks;
}

/**
 * Serialize set rows back into the DB-backed exercise fields (no new columns).
 * Uniform sets → `NxR` + `weight`; mixed loads → compact prescription string.
 */
export function setRowsToExercisePatch(
  rows: EditorSetRow[]
): Pick<
  EditorExercise,
  "prescription" | "plannedSets" | "targetReps" | "weight"
> {
  const cleaned =
    rows.length > 0 ? rows : [{ id: newSetRowId(), reps: "12", weightKg: "" }];
  const blocks = groupSetRows(cleaned);
  const plannedSets = cleaned.length;

  const repsValues = cleaned.map((row) => row.reps.trim() || "0");
  const uniqueReps = [...new Set(repsValues)];
  const targetRepsRaw =
    uniqueReps.length === 1 ? uniqueReps[0] : repsValues[repsValues.length - 1];
  const targetReps =
    !targetRepsRaw || targetRepsRaw === "0" ? null : targetRepsRaw;

  const weightValues = cleaned.map((row) => row.weightKg.trim());
  const uniqueWeights = [...new Set(weightValues)];
  const uniformWeight = uniqueWeights.length === 1;
  const uniformReps = uniqueReps.length === 1;

  if (uniformWeight && uniformReps) {
    return {
      prescription: buildPrescription(plannedSets, targetReps),
      plannedSets,
      targetReps,
      weight: formatWeightKg(uniqueWeights[0] ?? ""),
    };
  }

  const prescription = blocks
    .map((block) => {
      const weight = formatWeightKg(block.weightKg);
      const base = `${block.sets}x${block.reps}`;
      return weight ? `${base} ${weight}` : base;
    })
    .join("-");

  return {
    prescription,
    plannedSets,
    targetReps,
    weight: null,
  };
}

export function defaultSetRow(from?: EditorSetRow): EditorSetRow {
  return {
    id: newSetRowId(),
    reps: from?.reps?.trim() ? from.reps : "12",
    weightKg: from?.weightKg ?? "",
  };
}

export function updateEditorSetRow(
  rows: EditorSetRow[],
  index: number,
  patch: Partial<EditorSetRow>
): EditorSetRow[] {
  return rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
}

/** Append a set, copying the last row when present. */
export function addEditorSetRow(rows: EditorSetRow[]): EditorSetRow[] {
  return [...rows, defaultSetRow(rows[rows.length - 1])];
}

/** Remove a set; keep one empty row when the list would become empty. */
export function removeEditorSetRow(
  rows: EditorSetRow[],
  index: number
): EditorSetRow[] {
  if (rows.length <= 1) {
    return [{ id: newSetRowId(), reps: "", weightKg: "" }];
  }
  return rows.filter((_, i) => i !== index);
}
