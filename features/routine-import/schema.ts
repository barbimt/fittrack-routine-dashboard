import { z } from "zod";
import { plannedSetsSchema } from "@/features/routines/setSchema";

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((value) => (value ? value : null));

const importedExerciseSchema = z.object({
  name: text(120).min(1, "Every exercise needs a name"),
  sets: plannedSetsSchema,
  muscleGroup: z.string().nullable(),
  secondaryMuscles: z.array(z.string()).max(20),
  restTime: optionalText(20),
  notes: optionalText(1000),
  sortOrder: z.number().int().min(0),
});

const importedDaySchema = z.object({
  name: text(80).min(1),
  focus: optionalText(120),
  originalName: text(120),
  sortOrder: z.number().int().min(0),
  exercises: z.array(importedExerciseSchema).min(1).max(60),
});

/** Re-validates what the browser parsed: never trust the client payload. */
export const importedRoutineSchema = z.object({
  name: text(120).min(1),
  source: z.literal("excel"),
  days: z.array(importedDaySchema).min(1).max(14),
});

export type ImportedRoutine = z.infer<typeof importedRoutineSchema>;
