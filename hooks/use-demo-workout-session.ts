"use client";

import { useRef, useState } from "react";
import { getCompletedSets, getTotalSets } from "@/lib/mock-data";
import type { TrainingDay } from "@/lib/mock-data";
import {
  canSaveWorkoutForDay,
  findSetInDays,
  resetDayInDays,
  resetExerciseInDays,
  updateSetInDays,
} from "@/features/routines/dashboardDayState";
import { notify } from "@/lib/notify";
import {
  buildRepsChangePatch,
  buildSetTogglePatch,
  bumpRevisionMap,
} from "@/features/routines/setProgress";
import type { SessionSavedNotice } from "@/features/routines/types";

export interface UseDemoWorkoutSessionOptions {
  initialDays: TrainingDay[];
  initialDayId: string;
}

function cloneDays(days: TrainingDay[]): TrainingDay[] {
  return structuredClone(days);
}

export function useDemoWorkoutSession({
  initialDays,
  initialDayId,
}: UseDemoWorkoutSessionOptions) {
  const [daysData, setDaysData] = useState(() => cloneDays(initialDays));
  const [selectedDayId, setSelectedDayId] = useState(initialDayId);
  const [isSessionSaved, setIsSessionSaved] = useState(false);
  const [sessionSavedNotice, setSessionSavedNotice] =
    useState<SessionSavedNotice>("first");
  const [setRowRevision, setSetRowRevision] = useState<Record<string, number>>(
    {}
  );
  const hasSavedOnceRef = useRef(false);

  const selectedDay =
    daysData.find((d) => d.id === selectedDayId) ?? daysData[0];

  const completedSets = selectedDay ? getCompletedSets(selectedDay) : 0;
  const totalSets = selectedDay ? getTotalSets(selectedDay) : 0;
  const isDayComplete = totalSets > 0 && completedSets === totalSets;
  const canSaveWorkout = selectedDay
    ? canSaveWorkoutForDay(selectedDay)
    : false;
  const isReadOnly = isSessionSaved;

  const weeklyCompleted = daysData.reduce(
    (sum, day) => sum + getCompletedSets(day),
    0
  );
  const weeklyTotal = daysData.reduce((sum, day) => sum + getTotalSets(day), 0);

  const bumpSetRowRevision = (exerciseIds: string[]) => {
    setSetRowRevision((prev) => bumpRevisionMap(prev, exerciseIds));
  };

  const handleSetToggle = (setId: string) => {
    if (isReadOnly) return;

    const currentSet = findSetInDays(daysData, setId);
    if (!currentSet) return;

    setDaysData((prev) =>
      updateSetInDays(prev, setId, buildSetTogglePatch(currentSet))
    );

    if (isSessionSaved) {
      setIsSessionSaved(false);
    }
  };

  const handleRepsChange = (setId: string, reps: number | null) => {
    if (isReadOnly) return;
    setDaysData((prev) =>
      updateSetInDays(prev, setId, buildRepsChangePatch(reps))
    );
    if (isSessionSaved) {
      setIsSessionSaved(false);
    }
  };

  const handleRepsSave = (_setId: string, _reps: number | null) => {
    // Demo mode — reps live in local state only.
  };

  const handleSelectDay = (dayId: string) => {
    setSelectedDayId(dayId);
    setIsSessionSaved(false);
  };

  const handleResetExercise = (exerciseId: string) => {
    if (isReadOnly) return;

    setDaysData((prev) => resetExerciseInDays(prev, selectedDayId, exerciseId));
    bumpSetRowRevision([exerciseId]);
    setIsSessionSaved(false);
    notify.workout.exerciseReset();
  };

  const handleResetDay = () => {
    if (isReadOnly) return;

    setDaysData((prev) => resetDayInDays(prev, selectedDayId));
    bumpSetRowRevision(selectedDay.exercises.map((exercise) => exercise.id));
    setIsSessionSaved(false);
    hasSavedOnceRef.current = false;
    setSessionSavedNotice("first");
    notify.workout.dayReset("demo");
  };

  const handleSaveWorkout = () => {
    if (!canSaveWorkout) return;

    const isUpdate = hasSavedOnceRef.current;
    hasSavedOnceRef.current = true;
    setSessionSavedNotice(isUpdate ? "updated" : "first");
    setIsSessionSaved(true);
    notify.workout.workoutSaved(isUpdate, "demo");
  };

  const handleEditWorkout = () => {
    setIsSessionSaved(false);
    notify.workout.editingWorkout();
  };

  return {
    daysData,
    selectedDay,
    selectedDayId,
    completedSets,
    totalSets,
    isDayComplete,
    canSaveWorkout,
    isSessionSaved,
    isReadOnly,
    sessionSavedNotice,
    weeklyCompleted,
    weeklyTotal,
    isPending: false,
    isSaving: false,
    isReopening: false,
    isResetting: false,
    setRowRevision,
    handleSelectDay,
    handleSetToggle,
    handleRepsChange,
    handleRepsSave,
    handleResetExercise,
    handleResetDay,
    handleSaveWorkout,
    handleEditWorkout,
  };
}
