import { parsePrescriptionToSets } from "@/features/routine-import/utils/parsePrescription";
import { isSetType, parseRepsInput, type PlannedSet } from "./sets";
import type { RoutineExercise, RoutineExerciseSet } from "./types";
import { roundKg } from "./weight";

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function plannedSetsFromRows(
  rows: Pick<
    RoutineExerciseSet,
    "set_number" | "set_type" | "reps_min" | "reps_max" | "target_weight_kg"
  >[]
): PlannedSet[] {
  return [...rows]
    .sort((a, b) => a.set_number - b.set_number)
    .map((row) => {
      const kg = toNumberOrNull(row.target_weight_kg);
      return {
        setType: isSetType(row.set_type) ? row.set_type : "working",
        repsMin: toNumberOrNull(row.reps_min),
        repsMax: toNumberOrNull(row.reps_max),
        weightKg: kg === null ? null : roundKg(kg),
      };
    });
}

type LegacyExerciseFields = Pick<
  RoutineExercise,
  "prescription" | "planned_sets" | "target_reps" | "weight"
>;

/**
 * Builds planned sets for exercises saved before `routine_exercise_sets`
 * existed. Text that is not a number (`per leg`, `Bodyweight`, `5 min`) is
 * returned in `extraNotes` so it can be kept in the exercise notes.
 */
export function legacyExercisePlan(exercise: LegacyExerciseFields): {
  sets: PlannedSet[];
  extraNotes: string[];
} {
  const parsed = parsePrescriptionToSets(
    exercise.prescription,
    exercise.weight
  );
  if (parsed.ok) {
    return {
      sets: parsed.sets,
      extraNotes: [...parsed.notes, ...parsed.unreadable],
    };
  }

  const count =
    typeof exercise.planned_sets === "number" && exercise.planned_sets > 0
      ? exercise.planned_sets
      : 1;
  const reps = parseRepsInput(exercise.target_reps ?? "");
  const fallback = parsePrescriptionToSets(`1x1`, exercise.weight);
  const weightKg = fallback.sets[0]?.weightKg ?? null;

  const extraNotes = [
    ...(exercise.prescription && exercise.prescription !== "—"
      ? [exercise.prescription.trim()]
      : []),
    ...fallback.notes,
  ];

  return {
    sets: Array.from({ length: count }, () => ({
      setType: "working" as const,
      repsMin: reps?.repsMin ?? null,
      repsMax: reps?.repsMax ?? null,
      weightKg,
    })),
    extraNotes,
  };
}

export function hasSetRows(
  exercise: Pick<RoutineExercise, "routine_exercise_sets">
): boolean {
  return (exercise.routine_exercise_sets?.length ?? 0) > 0;
}

/** Planned sets for an exercise: stored rows when present, else parsed legacy columns. */
export function exercisePlannedSets(
  exercise: LegacyExerciseFields &
    Pick<RoutineExercise, "routine_exercise_sets">
): PlannedSet[] {
  if (
    exercise.routine_exercise_sets &&
    exercise.routine_exercise_sets.length > 0
  ) {
    return plannedSetsFromRows(exercise.routine_exercise_sets);
  }
  return legacyExercisePlan(exercise).sets;
}

/** Appends legacy leftovers (e.g. `Load: 8kg each`) to notes without duplicating them. */
export function mergeNotes(
  notes: string | null,
  extra: string[]
): string | null {
  const existing = notes?.trim() ?? "";
  const additions = extra
    .map((item) => item.trim())
    .filter(
      (item) =>
        item.length > 0 && !existing.toLowerCase().includes(item.toLowerCase())
    );
  const merged = [existing, ...additions].filter(Boolean).join(" · ");
  return merged.length > 0 ? merged : null;
}
