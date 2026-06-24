"use client";

import { useRef, useState, useTransition } from "react";
import { getCompletedSets, getTotalSets } from "@/lib/mock-data";
import type { TrainingDay } from "@/lib/mock-data";
import { isUuid } from "@/lib/uuid";
import { mergeSetLogsIntoDay } from "@/features/routines/routineMapper";
import {
  canSaveWorkoutForDay,
  findSetInDays,
  resetDayInDays,
  resetExerciseInDays,
  updateSetInDays,
} from "@/features/routines/dashboardDayState";
import {
  completeDaySession,
  getOrCreateDaySession,
  reopenDaySession,
  resetDaySession,
  resetExerciseSets,
  toggleSetLog,
  updateSetReps,
} from "@/features/routines/actions/sessionActions";
import type { SessionSavedNotice } from "@/features/routines/types";
import { toast } from "@/hooks/use-toast";

export interface UseWorkoutSessionOptions {
  initialDays: TrainingDay[];
  routineId: string;
  initialDayId: string;
  initialSessionId: string | null;
  initialSessionCompleted?: boolean;
}

const SESSION_NOT_READY_TOAST = {
  title: "Session not ready",
  description: "Wait for the workout session to load, then try again.",
  variant: "destructive" as const,
};

export function useWorkoutSession({
  initialDays,
  routineId,
  initialDayId,
  initialSessionId,
  initialSessionCompleted = false,
}: UseWorkoutSessionOptions) {
  const [daysData, setDaysData] = useState<TrainingDay[]>(initialDays);
  const [selectedDayId, setSelectedDayId] = useState(initialDayId);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [completedSessionIds, setCompletedSessionIds] = useState<
    Record<string, boolean>
  >(
    initialSessionId && initialSessionCompleted
      ? { [initialSessionId]: true }
      : {}
  );
  const [setRowRevision, setSetRowRevision] = useState<Record<string, number>>(
    {}
  );
  const [savedNotice, setSavedNotice] = useState<
    Record<string, SessionSavedNotice>
  >({});
  const [sessionIdsByDayId, setSessionIdsByDayId] = useState<
    Record<string, string>
  >(initialSessionId ? { [initialDayId]: initialSessionId } : {});
  const hasSavedOnceRef = useRef<Record<string, boolean>>(
    initialSessionId && initialSessionCompleted
      ? { [initialSessionId]: true }
      : {}
  );

  const selectedDay =
    daysData.find((d) => d.id === selectedDayId) ?? daysData[0];

  const completedSets = selectedDay ? getCompletedSets(selectedDay) : 0;
  const totalSets = selectedDay ? getTotalSets(selectedDay) : 0;
  const isDayComplete = totalSets > 0 && completedSets === totalSets;
  const canSaveWorkout = selectedDay
    ? canSaveWorkoutForDay(selectedDay)
    : false;
  const currentSessionId = sessionIdsByDayId[selectedDayId] ?? null;
  const isSessionSaved = currentSessionId
    ? completedSessionIds[currentSessionId] === true
    : false;
  const isReadOnly = isSessionSaved;
  const sessionSavedNotice: SessionSavedNotice =
    currentSessionId && savedNotice[currentSessionId] === "updated"
      ? "updated"
      : "first";

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

  const getSelectedSessionId = (): string | null => {
    const sessionId = sessionIdsByDayId[selectedDayId];
    if (!sessionId) {
      toast(SESSION_NOT_READY_TOAST);
      return null;
    }
    return sessionId;
  };

  const markSessionEditable = (sessionId: string) => {
    setCompletedSessionIds((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
  };

  const clearSessionSaveHistory = (sessionId: string) => {
    delete hasSavedOnceRef.current[sessionId];
    setSavedNotice((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
  };

  const handleSetToggle = (setId: string) => {
    if (isReadOnly || !isUuid(setId)) return;

    const currentSet = findSetInDays(daysData, setId);
    if (!currentSet) return;

    const nextCompleted = !currentSet.completed;
    const shouldAutoFillReps =
      nextCompleted && currentSet.actualReps == null;
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

    if (currentSessionId) {
      markSessionEditable(currentSessionId);
    }

    if (shouldAutoFillReps) {
      updateSetReps(setId, currentSet.targetReps);
    } else if (shouldClearReps) {
      updateSetReps(setId, null);
    }

    toggleSetLog(setId, nextCompleted).then((result) => {
      if (!result.ok) {
        setDaysData((prev) =>
          updateSetInDays(prev, setId, {
            completed: currentSet.completed,
            actualReps: currentSet.actualReps,
          })
        );
        toast({
          title: "Could not update set",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const handleRepsChange = (setId: string, reps: number) => {
    if (isReadOnly || !isUuid(setId)) return;

    setDaysData((prev) => updateSetInDays(prev, setId, { actualReps: reps }));

    if (currentSessionId) {
      markSessionEditable(currentSessionId);
    }
  };

  const handleRepsSave = (setId: string, reps: number) => {
    if (!isUuid(setId)) return;
    updateSetReps(setId, reps);
  };

  const handleSelectDay = (dayId: string) => {
    setSelectedDayId(dayId);

    if (sessionIdsByDayId[dayId]) return;

    startTransition(async () => {
      const result = await getOrCreateDaySession(routineId, dayId);
      if (!result.ok) return;

      setSessionIdsByDayId((prev) => ({ ...prev, [dayId]: result.sessionId }));

      if (result.sessionStatus === "completed") {
        setCompletedSessionIds((prev) => ({
          ...prev,
          [result.sessionId]: true,
        }));
      }

      setDaysData((prev) =>
        prev.map((d) =>
          d.id === dayId ? mergeSetLogsIntoDay(d, result.setLogs) : d
        )
      );
    });
  };

  const handleResetExercise = (exerciseId: string) => {
    const sessionId = getSelectedSessionId();
    if (!sessionId) return;

    const previousDays = daysData;
    setDaysData((prev) => resetExerciseInDays(prev, selectedDayId, exerciseId));
    bumpSetRowRevision([exerciseId]);

    if (currentSessionId) {
      markSessionEditable(currentSessionId);
    }

    resetExerciseSets(sessionId, exerciseId).then((result) => {
      if (!result.ok) {
        setDaysData(previousDays);
        toast({
          title: "Could not reset exercise",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Exercise reset",
        description: "Sets cleared for this exercise.",
      });
    });
  };

  const handleResetDay = () => {
    const sessionId = getSelectedSessionId();
    if (!sessionId) return;

    const previousDays = daysData;
    setDaysData((prev) => resetDayInDays(prev, selectedDayId));
    bumpSetRowRevision(selectedDay.exercises.map((exercise) => exercise.id));

    markSessionEditable(sessionId);
    clearSessionSaveHistory(sessionId);

    setIsResetting(true);
    resetDaySession(sessionId).then((result) => {
      setIsResetting(false);
      if (!result.ok) {
        setDaysData(previousDays);
        toast({
          title: "Could not reset day",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Day reset",
        description: "All sets cleared for today’s session.",
      });
    });
  };

  const handleSaveWorkout = async () => {
    if (!canSaveWorkout) return;

    const sessionId = getSelectedSessionId();
    if (!sessionId) return;

    const isUpdate = hasSavedOnceRef.current[sessionId] === true;

    setIsSaving(true);
    const result = await completeDaySession(sessionId);
    setIsSaving(false);

    if (!result.ok) {
      toast({
        title: "Could not save workout",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    hasSavedOnceRef.current[sessionId] = true;
    setSavedNotice((prev) => ({
      ...prev,
      [sessionId]: isUpdate ? "updated" : "first",
    }));
    setCompletedSessionIds((prev) => ({ ...prev, [sessionId]: true }));
    toast({
      title: isUpdate ? "Workout updated" : "Workout saved",
      description: isUpdate
        ? "Your changes are stored."
        : "Today’s progress is stored for analytics and history.",
    });
  };

  const handleEditWorkout = async () => {
    const sessionId = getSelectedSessionId();
    if (!sessionId) return;

    setIsReopening(true);
    const result = await reopenDaySession(sessionId);
    setIsReopening(false);

    if (!result.ok) {
      toast({
        title: "Could not edit workout",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    markSessionEditable(sessionId);
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
    isPending,
    isSaving,
    isReopening,
    isResetting,
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
