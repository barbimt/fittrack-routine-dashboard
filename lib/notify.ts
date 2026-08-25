import { toast } from "@/hooks/use-toast";

export type NotifyVariant = "default" | "success" | "destructive";

export type NotifyOptions = {
  title: string;
  description?: string;
  duration?: number;
};

export type WorkoutNotifyMode = "live" | "demo";

const DEFAULT_DURATION_MS = 4000;

function show(variant: NotifyVariant, options: NotifyOptions) {
  return toast({
    variant,
    title: options.title,
    description: options.description,
    duration: options.duration ?? DEFAULT_DURATION_MS,
  });
}

const workout = {
  notReady() {
    return show("destructive", {
      title: "Session not ready",
      description: "Wait for the workout session to load, then try again.",
    });
  },

  setUpdateFailed(error: string) {
    return show("destructive", {
      title: "Could not update set",
      description: error,
    });
  },

  exerciseReset() {
    return show("default", {
      title: "Exercise reset",
      description: "Sets cleared for this exercise.",
    });
  },

  exerciseResetFailed(error: string) {
    return show("destructive", {
      title: "Could not reset exercise",
      description: error,
    });
  },

  dayReset(mode: WorkoutNotifyMode = "live") {
    return show("default", {
      title: "Day reset",
      description:
        mode === "demo"
          ? "All sets cleared for this training day."
          : "All sets cleared for today’s session.",
    });
  },

  dayResetFailed(error: string) {
    return show("destructive", {
      title: "Could not reset day",
      description: error,
    });
  },

  workoutSaved(isUpdate: boolean, mode: WorkoutNotifyMode = "live") {
    if (mode === "demo") {
      return show("default", {
        title: isUpdate ? "Workout updated (demo)" : "Workout saved (demo)",
        description:
          "Create a free account to save your real routines and track progress over time.",
      });
    }

    return show("default", {
      title: isUpdate ? "Workout updated" : "Workout saved",
      description: isUpdate
        ? "Your changes are stored."
        : "Today’s progress is stored for analytics and history.",
    });
  },

  workoutSaveFailed(error: string) {
    return show("destructive", {
      title: "Could not save workout",
      description: error,
    });
  },

  exerciseAdded(name: string) {
    return show("default", {
      title: "Exercise added",
      description: `${name} is ready in today’s session.`,
    });
  },

  exerciseAddFailed(error: string) {
    return show("destructive", {
      title: "Could not add exercise",
      description: error,
    });
  },

  exerciseUpdated() {
    return show("default", {
      title: "Exercise updated",
      description: "Targets refreshed for today’s session.",
    });
  },

  exerciseUpdateFailed(error: string) {
    return show("destructive", {
      title: "Could not update exercise",
      description: error,
    });
  },

  editingWorkout() {
    return show("default", {
      title: "Editing workout",
      description: "You can update sets and reps, then save again.",
    });
  },

  editWorkoutFailed(error: string) {
    return show("destructive", {
      title: "Could not edit workout",
      description: error,
    });
  },
};

export const notify = {
  info(options: NotifyOptions) {
    return show("default", options);
  },
  success(options: NotifyOptions) {
    return show("success", options);
  },
  error(options: NotifyOptions) {
    return show("destructive", options);
  },
  restComplete(exerciseName?: string) {
    return show("success", {
      title: "Rest done",
      description: exerciseName
        ? `Time for the next set of ${exerciseName}.`
        : "Time for your next set.",
      duration: 5000,
    });
  },
  workout,
};
