// Types
export interface ExerciseSet {
  id: string;
  setNumber: number;
  targetReps: number;
  actualReps: number | null;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: number | string;
  weight: string;
  restTime: string;
  notes?: string;
  sets: ExerciseSet[];
}

export interface TrainingDay {
  id: string;
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

export interface WeeklyStats {
  totalPlannedSets: number;
  completedSets: number;
  muscleGroups: { name: string; sets: number }[];
}

// Mock Data
export const trainingDays: TrainingDay[] = [
  {
    id: "monday",
    dayName: "Monday",
    focus: "Glutes & Hamstrings",
    exercises: [
      {
        id: "ex1",
        name: "Hip Thrust",
        muscleGroup: "Glutes",
        targetSets: 4,
        targetReps: 10,
        weight: "60kg",
        restTime: "90s",
        notes: "Focus on controlled movement",
        sets: [
          {
            id: "s1",
            setNumber: 1,
            targetReps: 10,
            actualReps: 10,
            completed: true,
          },
          {
            id: "s2",
            setNumber: 2,
            targetReps: 10,
            actualReps: 12,
            completed: true,
          },
          {
            id: "s3",
            setNumber: 3,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s4",
            setNumber: 4,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex2",
        name: "Romanian Deadlift",
        muscleGroup: "Hamstrings",
        targetSets: 3,
        targetReps: 8,
        weight: "45kg",
        restTime: "120s",
        notes: "Keep back straight, hinge at hips",
        sets: [
          {
            id: "s5",
            setNumber: 1,
            targetReps: 8,
            actualReps: 8,
            completed: true,
          },
          {
            id: "s6",
            setNumber: 2,
            targetReps: 8,
            actualReps: 8,
            completed: true,
          },
          {
            id: "s7",
            setNumber: 3,
            targetReps: 8,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex3",
        name: "Bulgarian Split Squat",
        muscleGroup: "Glutes",
        targetSets: 3,
        targetReps: "10 each leg",
        weight: "Bodyweight",
        restTime: "90s",
        sets: [
          {
            id: "s8",
            setNumber: 1,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s9",
            setNumber: 2,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s10",
            setNumber: 3,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex4",
        name: "Cable Kickback",
        muscleGroup: "Glutes",
        targetSets: 3,
        targetReps: 12,
        weight: "15kg",
        restTime: "60s",
        sets: [
          {
            id: "s11",
            setNumber: 1,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s12",
            setNumber: 2,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s13",
            setNumber: 3,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "tuesday",
    dayName: "Tuesday",
    focus: "Upper Body",
    exercises: [
      {
        id: "ex5",
        name: "Lat Pulldown",
        muscleGroup: "Back",
        targetSets: 4,
        targetReps: 12,
        weight: "35kg",
        restTime: "90s",
        sets: [
          {
            id: "s14",
            setNumber: 1,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s15",
            setNumber: 2,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s16",
            setNumber: 3,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s17",
            setNumber: 4,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex6",
        name: "Seated Row",
        muscleGroup: "Back",
        targetSets: 3,
        targetReps: 10,
        weight: "30kg",
        restTime: "90s",
        sets: [
          {
            id: "s18",
            setNumber: 1,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s19",
            setNumber: 2,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s20",
            setNumber: 3,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex7",
        name: "Shoulder Press",
        muscleGroup: "Shoulders",
        targetSets: 3,
        targetReps: 10,
        weight: "12kg",
        restTime: "90s",
        sets: [
          {
            id: "s21",
            setNumber: 1,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s22",
            setNumber: 2,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s23",
            setNumber: 3,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex8",
        name: "Bicep Curl",
        muscleGroup: "Arms",
        targetSets: 3,
        targetReps: 12,
        weight: "8kg",
        restTime: "60s",
        sets: [
          {
            id: "s24",
            setNumber: 1,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s25",
            setNumber: 2,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s26",
            setNumber: 3,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "wednesday",
    dayName: "Wednesday",
    focus: "Core & Mobility",
    exercises: [
      {
        id: "ex9",
        name: "Plank Hold",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: "60s",
        weight: "Bodyweight",
        restTime: "60s",
        sets: [
          {
            id: "s27",
            setNumber: 1,
            targetReps: 60,
            actualReps: null,
            completed: false,
          },
          {
            id: "s28",
            setNumber: 2,
            targetReps: 60,
            actualReps: null,
            completed: false,
          },
          {
            id: "s29",
            setNumber: 3,
            targetReps: 60,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex10",
        name: "Dead Bug",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: 12,
        weight: "Bodyweight",
        restTime: "45s",
        sets: [
          {
            id: "s30",
            setNumber: 1,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s31",
            setNumber: 2,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s32",
            setNumber: 3,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "thursday",
    dayName: "Thursday",
    focus: "Quads & Glutes",
    exercises: [
      {
        id: "ex11",
        name: "Leg Press",
        muscleGroup: "Quads",
        targetSets: 4,
        targetReps: 12,
        weight: "80kg",
        restTime: "120s",
        sets: [
          {
            id: "s33",
            setNumber: 1,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s34",
            setNumber: 2,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s35",
            setNumber: 3,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
          {
            id: "s36",
            setNumber: 4,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex12",
        name: "Goblet Squat",
        muscleGroup: "Quads",
        targetSets: 3,
        targetReps: 10,
        weight: "16kg",
        restTime: "90s",
        sets: [
          {
            id: "s37",
            setNumber: 1,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s38",
            setNumber: 2,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s39",
            setNumber: 3,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "friday",
    dayName: "Friday",
    focus: "Full Body",
    exercises: [
      {
        id: "ex13",
        name: "Dumbbell Bench Press",
        muscleGroup: "Chest",
        targetSets: 3,
        targetReps: 10,
        weight: "14kg",
        restTime: "90s",
        sets: [
          {
            id: "s40",
            setNumber: 1,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s41",
            setNumber: 2,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
          {
            id: "s42",
            setNumber: 3,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex14",
        name: "Kettlebell Swing",
        muscleGroup: "Full Body",
        targetSets: 3,
        targetReps: 15,
        weight: "12kg",
        restTime: "60s",
        sets: [
          {
            id: "s43",
            setNumber: 1,
            targetReps: 15,
            actualReps: null,
            completed: false,
          },
          {
            id: "s44",
            setNumber: 2,
            targetReps: 15,
            actualReps: null,
            completed: false,
          },
          {
            id: "s45",
            setNumber: 3,
            targetReps: 15,
            actualReps: null,
            completed: false,
          },
        ],
      },
    ],
  },
];

export const weeklyStats: WeeklyStats = {
  totalPlannedSets: 45,
  completedSets: 4,
  muscleGroups: [
    { name: "Glutes", sets: 13 },
    { name: "Back", sets: 7 },
    { name: "Quads", sets: 7 },
    { name: "Core", sets: 6 },
    { name: "Arms", sets: 6 },
    { name: "Shoulders", sets: 3 },
    { name: "Chest", sets: 3 },
  ],
};

// Helper functions
export function getCompletedSets(day: TrainingDay): number {
  return day.exercises.reduce(
    (total, exercise) =>
      total + exercise.sets.filter((set) => set.completed).length,
    0
  );
}

export function getTotalSets(day: TrainingDay): number {
  return day.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0
  );
}

export function getExerciseProgress(exercise: Exercise): {
  completed: number;
  total: number;
} {
  const completed = exercise.sets.filter((set) => set.completed).length;
  return { completed, total: exercise.sets.length };
}
