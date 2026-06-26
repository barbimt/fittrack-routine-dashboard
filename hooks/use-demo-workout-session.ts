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
import type { SessionSavedNotice } from "@/features/routines/types";
import { toast } from "@/hooks/use-toast";

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
    setSetRowRevision((prev) => {
      const next = { ...prev };
      for (const id of exerciseIds) {
        next[id] = (next[id] ?? 0) + 1;
      }
      return next;
    });
  };

  const handleSetToggle = (setId: string) => {
    if (isReadOnly) return;

    const currentSet = findSetInDays(daysData, setId);
    if (!currentSet) return;

    const nextCompleted = !currentSet.completed;
    const shouldAutoFillReps = nextCompleted && currentSet.actualReps == null;
    const shouldClearReps = !nextCompleted;

    setDaysData((prev) =>
      updateSetInDays(prev, setId, {
        completed: nextCompleted,
        ...(shouldAutoFillReps
          ? { actualReps: currentSet.targetReps }
          : shouldClearReps
            ? { actualReps: null }
            : {}),
      })
    );

    if (isSessionSaved) {
      setIsSessionSaved(false);
    }
  };

  const handleRepsChange = (setId: string, reps: number) => {
    if (isReadOnly) return;
    setDaysData((prev) => updateSetInDays(prev, setId, { actualReps: reps }));
    if (isSessionSaved) {
      setIsSessionSaved(false);
    }
  };

  const handleRepsSave = (_setId: string, _reps: number) => {
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
    toast({
      title: "Exercise reset",
      description: "Sets cleared for this exercise.",
    });
  };

  const handleResetDay = () => {
    if (isReadOnly) return;

    setDaysData((prev) => resetDayInDays(prev, selectedDayId));
    bumpSetRowRevision(selectedDay.exercises.map((exercise) => exercise.id));
    setIsSessionSaved(false);
    hasSavedOnceRef.current = false;
    setSessionSavedNotice("first");
    toast({
      title: "Day reset",
      description: "All sets cleared for this training day.",
    });
  };

  const handleSaveWorkout = () => {
    if (!canSaveWorkout) return;

    const isUpdate = hasSavedOnceRef.current;
    hasSavedOnceRef.current = true;
    setSessionSavedNotice(isUpdate ? "updated" : "first");
    setIsSessionSaved(true);
    toast({
      title: isUpdate ? "Workout updated (demo)" : "Workout saved (demo)",
      description:
        "Create a free account to save your real routines and track progress over time.",
    });
  };

  const handleEditWorkout = () => {
    setIsSessionSaved(false);
    toast({
      title: "Editing workout",
      description: "You can update sets and reps, then save again.",
    });
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
