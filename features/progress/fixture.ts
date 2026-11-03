import type { ProgressDashboard } from "./schema";

const definitions: ProgressDashboard["definitions"] = {
  hardSet: "A completed set whose type is not warmup.",
  tonnageKg: "Reps times kilograms, only when a hard set has both values.",
  e1rmKg:
    "Epley estimate: weight * (1 + reps / 30), only for 1 to 12 reps with weight.",
  workout: "A non-cancelled session with at least one hard set.",
  adherence:
    "Workouts in the period divided by active routine days times comparison weeks. Uses the current active routine.",
  personalRecord:
    "A set whose e1RM is higher than every earlier set of the same exercise name.",
  loadProgress:
    "An exercise improved when its best estimated 1RM in this period is higher than in the previous period.",
};

export const progressFixture: ProgressDashboard = {
  schemaVersion: 1,
  generatedAt: "2026-11-03T12:00:00.000Z",
  window: {
    weeks: 12,
    from: "2026-08-17",
    to: "2026-11-03",
    comparisonWeeks: 4,
  },
  units: { weight: "kg", tonnage: "kg", e1rm: "kg" },
  definitions,
  notTracked: [
    "RPE or reps in reserve",
    "Body weight",
    "Waist and hip measurements",
    "Actual rest time",
    "Secondary muscle credit",
  ],
  plan: {
    activeRoutineDays: 5,
    comparisonWeeks: 4,
    plannedSessions: 20,
  },
  kpis: {
    recent: {
      workouts: 8,
      hardSets: 52,
      tonnageKg: 12400,
      trainingDays: 8,
      adherence: 0.4,
    },
    previous: {
      workouts: 6,
      hardSets: 40,
      tonnageKg: 10000,
      trainingDays: 6,
      adherence: 0.3,
    },
  },
  loadProgress: {
    improved: 1,
    tracked: 2,
    best: { exerciseName: "Hip Thrust", deltaKg: 5.33 },
  },
  weeks: [
    { weekStart: "2026-10-26", workouts: 2, hardSets: 14, tonnageKg: 3200 },
    { weekStart: "2026-11-02", workouts: 1, hardSets: 6, tonnageKg: 640 },
  ],
  muscles: [
    { muscleGroup: "glutes", recentHardSets: 16, previousHardSets: 12 },
    { muscleGroup: "back", recentHardSets: 8, previousHardSets: 10 },
  ],
  exercises: [
    {
      name: "Hip Thrust",
      hardSets: 12,
      tonnageKg: 3840,
      bestE1rmKg: 101.33,
      weeklyBestE1rm: [
        { weekStart: "2026-10-26", e1rmKg: 96 },
        { weekStart: "2026-11-02", e1rmKg: 101.33 },
      ],
    },
    {
      name: "Lat Pulldown",
      hardSets: 9,
      tonnageKg: 1440,
      bestE1rmKg: 53.33,
      weeklyBestE1rm: [
        { weekStart: "2026-10-26", e1rmKg: 50 },
        { weekStart: "2026-11-02", e1rmKg: null },
      ],
    },
  ],
  personalRecords: [
    {
      exerciseName: "Hip Thrust",
      e1rmKg: 101.33,
      sessionDate: "2026-11-03",
      weightKg: 80,
      reps: 8,
    },
  ],
  recentSessions: [
    {
      sessionDate: "2026-11-03",
      dayName: "Monday — Glutes",
      status: "completed",
      hardSets: 6,
      tonnageKg: 640,
      exercises: [
        {
          name: "Hip Thrust",
          hardSets: 4,
          bestWeightKg: 80,
          bestReps: 8,
        },
      ],
    },
  ],
};
