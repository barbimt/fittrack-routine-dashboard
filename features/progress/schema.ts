import { z } from "zod";

const kpiSchema = z.object({
  workouts: z.number().int().nonnegative(),
  hardSets: z.number().int().nonnegative(),
  tonnageKg: z.number().nonnegative(),
  trainingDays: z.number().int().nonnegative(),
  adherence: z.number().nullable(),
});

const weekPointSchema = z.object({
  weekStart: z.string(),
  workouts: z.number().int().nonnegative(),
  hardSets: z.number().int().nonnegative(),
  tonnageKg: z.number().nonnegative(),
});

export const progressDashboardSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string(),
  window: z.object({
    weeks: z.number().int().positive(),
    from: z.string(),
    to: z.string(),
    comparisonWeeks: z.number().int().positive(),
  }),
  units: z.object({
    weight: z.literal("kg"),
    tonnage: z.literal("kg"),
    e1rm: z.literal("kg"),
  }),
  definitions: z.object({
    hardSet: z.string(),
    tonnageKg: z.string(),
    e1rmKg: z.string(),
    workout: z.string(),
    adherence: z.string(),
    personalRecord: z.string(),
    loadProgress: z.string(),
  }),
  notTracked: z.array(z.string()),
  plan: z.object({
    activeRoutineDays: z.number().int().nonnegative(),
    comparisonWeeks: z.number().int().positive(),
    plannedSessions: z.number().int().nonnegative(),
  }),
  kpis: z.object({
    recent: kpiSchema,
    previous: kpiSchema,
  }),
  loadProgress: z.object({
    improved: z.number().int().nonnegative(),
    tracked: z.number().int().nonnegative(),
    best: z
      .object({
        exerciseName: z.string(),
        deltaKg: z.number(),
      })
      .nullable(),
  }),
  weeks: z.array(weekPointSchema),
  muscles: z.array(
    z.object({
      muscleGroup: z.string(),
      recentHardSets: z.number().int().nonnegative(),
      previousHardSets: z.number().int().nonnegative(),
    })
  ),
  exercises: z.array(
    z.object({
      name: z.string(),
      hardSets: z.number().int().nonnegative(),
      tonnageKg: z.number().nonnegative(),
      bestE1rmKg: z.number().nullable(),
      weeklyBestE1rm: z.array(
        z.object({
          weekStart: z.string(),
          e1rmKg: z.number().nullable(),
        })
      ),
    })
  ),
  personalRecords: z.array(
    z.object({
      exerciseName: z.string(),
      e1rmKg: z.number().nonnegative(),
      sessionDate: z.string(),
      weightKg: z.number().nonnegative(),
      reps: z.number().int().positive(),
    })
  ),
  recentSessions: z.array(
    z.object({
      sessionDate: z.string(),
      dayName: z.string(),
      status: z.string(),
      hardSets: z.number().int().nonnegative(),
      tonnageKg: z.number().nonnegative(),
      exercises: z.array(
        z.object({
          name: z.string(),
          hardSets: z.number().int().nonnegative(),
          bestWeightKg: z.number().nullable(),
          bestReps: z.number().int().nullable(),
        })
      ),
    })
  ),
});

export type ProgressDashboard = z.infer<typeof progressDashboardSchema>;

export type ProgressLoadResult =
  | { ok: true; data: ProgressDashboard }
  | { ok: false; error: string };

export function parseProgressDashboard(value: unknown): ProgressDashboard {
  return progressDashboardSchema.parse(value);
}

export function hasProgressData(data: ProgressDashboard): boolean {
  return (
    data.weeks.some((week) => week.hardSets > 0) ||
    data.personalRecords.length > 0 ||
    data.recentSessions.length > 0
  );
}

export function assignedMuscles(muscles: ProgressDashboard["muscles"]) {
  return muscles.filter((muscle) => muscle.muscleGroup !== "unassigned");
}
