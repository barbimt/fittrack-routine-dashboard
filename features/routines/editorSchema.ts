import { z } from "zod";
import { validateEditorSets } from "./editorSetRows";
import type { EditorDay } from "./editorTypes";
import { MAX_SETS_PER_EXERCISE } from "./sets";

const setInputSchema = z.object({
  setType: z.enum(["warmup", "working", "drop"]),
  reps: z.string(),
  weightKg: z.string(),
});

const exerciseSchema = z.object({
  name: z.string().trim().min(1, "Exercise name is required"),
  sets: z
    .array(setInputSchema)
    .min(1, "Add at least one set")
    .max(MAX_SETS_PER_EXERCISE, `Use ${MAX_SETS_PER_EXERCISE} sets or fewer`)
    .superRefine((sets, ctx) => {
      for (const issue of validateEditorSets(sets)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message });
      }
    }),
});

const daySchema = z.object({
  name: z.string().trim().min(1, "Day name is required"),
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise"),
});

export const routineDaysSchema = z
  .array(daySchema)
  .min(1, "Add at least one training day");

export interface DayValidationError {
  dayId: string;
  dayName: string;
  messages: string[];
}

export function validateRoutineDays(days: EditorDay[]): DayValidationError[] {
  const result = routineDaysSchema.safeParse(days);
  if (result.success) return [];

  const byDayIndex = new Map<number, Set<string>>();
  const rootMessages = new Set<string>();

  for (const issue of result.error.issues) {
    const dayIndex = typeof issue.path[0] === "number" ? issue.path[0] : null;
    if (dayIndex === null) {
      rootMessages.add(issue.message);
      continue;
    }

    const messages = byDayIndex.get(dayIndex) ?? new Set<string>();

    if (issue.path[1] === "exercises" && typeof issue.path[2] === "number") {
      messages.add(`Exercise ${issue.path[2] + 1}: ${issue.message}`);
    } else {
      messages.add(issue.message);
    }

    byDayIndex.set(dayIndex, messages);
  }

  if (byDayIndex.size === 0 && rootMessages.size > 0) {
    return [
      {
        dayId: "routine",
        dayName: "Routine",
        messages: [...rootMessages],
      },
    ];
  }

  return [...byDayIndex.entries()].map(([index, messages]) => ({
    dayId: days[index]?.id ?? String(index),
    dayName: days[index]?.name?.trim() || `Day ${index + 1}`,
    messages: [...messages],
  }));
}
