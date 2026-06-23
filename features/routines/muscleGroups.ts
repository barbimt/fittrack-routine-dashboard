/** Fixed list of muscle groups offered in the routine editor's muscle select. */
export const MUSCLE_GROUPS = [
  "Glutes",
  "Hamstrings",
  "Quads",
  "Calves",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Core",
  "Forearms",
  "Full Body",
  "Cardio",
  "Other",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/** Sentinel value for the "no muscle selected" option (Radix Select forbids ""). */
export const MUSCLE_GROUP_NONE = "none";
