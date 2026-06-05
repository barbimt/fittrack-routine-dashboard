import type { ExerciseSet, TrainingDay } from "@/lib/mock-data";

export type SetFieldPatch = Partial<
  Pick<ExerciseSet, "completed" | "actualReps">
>;

export function findSetInDays(
  days: TrainingDay[],
  setId: string
): ExerciseSet | null {
  for (const day of days) {
    for (const exercise of day.exercises) {
      const set = exercise.sets.find((s) => s.id === setId);
      if (set) return set;
    }
  }
  return null;
}

export function updateSetInDays(
  days: TrainingDay[],
  setId: string,
  patch: SetFieldPatch
): TrainingDay[] {
  return days.map((day) => ({
    ...day,
    exercises: day.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) =>
        set.id === setId ? { ...set, ...patch } : set
      ),
    })),
  }));
}

export function resetExerciseInDays(
  days: TrainingDay[],
  dayId: string,
  exerciseId: string
): TrainingDay[] {
  return days.map((day) =>
    day.id !== dayId
      ? day
      : {
          ...day,
          exercises: day.exercises.map((exercise) =>
            exercise.id !== exerciseId
              ? exercise
              : {
                  ...exercise,
                  sets: exercise.sets.map((set) => ({
                    ...set,
                    completed: false,
                    actualReps: null,
                  })),
                }
          ),
        }
  );
}

export function resetDayInDays(
  days: TrainingDay[],
  dayId: string
): TrainingDay[] {
  return days.map((day) =>
    day.id !== dayId
      ? day
      : {
          ...day,
          exercises: day.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => ({
              ...set,
              completed: false,
              actualReps: null,
            })),
          })),
        }
  );
}

export function canSaveWorkoutForDay(day: TrainingDay): boolean {
  return day.exercises.some((exercise) =>
    exercise.sets.some((set) => set.completed)
  );
}
