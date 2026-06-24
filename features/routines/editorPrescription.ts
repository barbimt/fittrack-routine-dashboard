import {
  hasWeightInPrescriptionText,
  isVariablePrescriptionStructure,
  parsePrescription,
  parsePrescriptionBlocks,
} from "@/features/routine-import/utils/parsePrescription";
import { buildPrescription } from "./prescription";
import type { EditorExercise } from "./editorTypes";
import type { RoutineExerciseUpsert } from "./routinePatch";

export type PrescriptionEditorUiState = {
  setsRepsEditable: boolean;
  weightMode: "editable" | "in-prescription";
  weightNote: string;
  setsRepsNote?: string;
};

export function getPrescriptionEditorUiState(
  prescription: string | null
): PrescriptionEditorUiState {
  const trimmed = prescription?.trim() ?? "";

  if (!trimmed) {
    return {
      setsRepsEditable: true,
      weightMode: "editable",
      weightNote: "Optional — same load for every set (e.g. 60kg)",
    };
  }

  if (hasWeightInPrescriptionText(trimmed)) {
    const blocks = parsePrescriptionBlocks(trimmed, null);
    const weights = blocks
      .map((block) => block.weight)
      .filter((weight): weight is string => Boolean(weight));
    const uniqueWeights = new Set(weights);
    const weightNote =
      uniqueWeights.size > 1
        ? "Varies by set"
        : weights[0]
          ? weights[0]
          : "In prescription";

    return {
      setsRepsEditable: false,
      weightMode: "in-prescription",
      weightNote,
      setsRepsNote: "Synced from prescription",
    };
  }

  if (isVariablePrescriptionStructure(trimmed)) {
    return {
      setsRepsEditable: false,
      weightMode: "editable",
      weightNote: "Optional — same load for every set in this prescription",
      setsRepsNote: "Synced from prescription",
    };
  }

  return {
    setsRepsEditable: true,
    weightMode: "editable",
    weightNote: "Optional — same load for every set (e.g. 60kg)",
  };
}

export function editorPatchFromPrescription(
  prescription: string,
  fallbackWeight: string | null
): Pick<EditorExercise, "prescription" | "plannedSets" | "targetReps" | "weight"> {
  const trimmed = prescription.trim();
  const parsed = parsePrescription(trimmed, fallbackWeight);
  const ui = getPrescriptionEditorUiState(trimmed || null);

  return {
    prescription: trimmed.length > 0 ? trimmed : null,
    plannedSets: parsed.plannedSets,
    targetReps: parsed.targetReps,
    ...(ui.weightMode === "in-prescription" ? { weight: null } : {}),
  };
}

export function editorPatchFromSimpleFields(
  plannedSets: number | null,
  targetReps: string | null,
  weight: string | null
): Pick<
  EditorExercise,
  "prescription" | "plannedSets" | "targetReps" | "weight"
> {
  return {
    prescription: buildPrescription(plannedSets, targetReps),
    plannedSets,
    targetReps,
    weight,
  };
}

/** Prescription text + parsed sets/reps persisted to the DB on save. */
export function resolvePrescriptionForSave(exercise: RoutineExerciseUpsert): {
  prescription: string;
  plannedSets: number | null;
  targetReps: string | null;
} {
  const trimmed = exercise.prescription?.trim();
  if (trimmed) {
    const parsed = parsePrescription(trimmed, exercise.weight);
    return {
      prescription: trimmed,
      plannedSets: parsed.plannedSets,
      targetReps: parsed.targetReps,
    };
  }

  return {
    prescription: buildPrescription(exercise.plannedSets, exercise.targetReps),
    plannedSets: exercise.plannedSets,
    targetReps: exercise.targetReps,
  };
}
