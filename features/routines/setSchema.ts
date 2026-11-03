import { z } from "zod";
import { MUSCLE_GROUP_SLUGS, type MuscleGroup } from "./muscleGroups";
import {
  MAX_REPS,
  MAX_SETS_PER_EXERCISE,
  SET_TYPES,
  type PlannedSet,
} from "./sets";
import { MAX_WEIGHT_KG, roundKg } from "./weight";

const reps = z.number().int().min(1).max(MAX_REPS).nullable();

export const plannedSetSchema = z
  .object({
    setType: z.enum(SET_TYPES),
    repsMin: reps,
    repsMax: reps,
    weightKg: z
      .number()
      .min(0)
      .max(MAX_WEIGHT_KG)
      .nullable()
      .transform((kg) => (kg === null ? null : roundKg(kg))),
  })
  .refine(
    (set) =>
      set.repsMin === null ||
      set.repsMax === null ||
      set.repsMax >= set.repsMin,
    { message: "Max reps must be greater than or equal to min reps" }
  );

export const plannedSetsSchema = z
  .array(plannedSetSchema)
  .min(1, "Add at least one set")
  .max(MAX_SETS_PER_EXERCISE, `Use ${MAX_SETS_PER_EXERCISE} sets or fewer`);

export const muscleGroupSchema = z
  .string()
  .refine((value): value is MuscleGroup =>
    (MUSCLE_GROUP_SLUGS as readonly string[]).includes(value)
  );

export const secondaryMusclesSchema = z
  .array(muscleGroupSchema)
  .max(MUSCLE_GROUP_SLUGS.length)
  .transform((list) => [...new Set(list)]);

export function parsePlannedSets(
  value: unknown
): { ok: true; sets: PlannedSet[] } | { ok: false; error: string } {
  const result = plannedSetsSchema.safeParse(value);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "Invalid sets.",
    };
  }
  return { ok: true, sets: result.data };
}

/** Keeps only known slugs; anything else becomes null / is dropped. */
export function sanitizeMuscles(
  primary: string | null | undefined,
  secondary: readonly string[] | null | undefined
): { muscleGroup: MuscleGroup | null; secondaryMuscles: MuscleGroup[] } {
  const muscleGroup = muscleGroupSchema.safeParse(primary ?? "").success
    ? (primary as MuscleGroup)
    : null;
  const secondaryMuscles = [...new Set(secondary ?? [])].filter(
    (slug): slug is MuscleGroup =>
      muscleGroupSchema.safeParse(slug).success && slug !== muscleGroup
  );
  return { muscleGroup, secondaryMuscles };
}
