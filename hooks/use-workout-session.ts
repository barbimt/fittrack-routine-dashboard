"use client";

import { useRef, useState, useTransition } from "react";
import { getCompletedSets, getTotalSets } from "@/lib/mock-data";
import type { TrainingDay } from "@/lib/mock-data";
import { isUuid } from "@/lib/uuid";
import { appendExerciseToDay, replaceExerciseInDay } from "@/features/routines/routineMapper";
import {
  canSaveWorkoutForDay,
  findSetInDays,
  resetDayInDays,
  resetExerciseInDays,
  updateSetInDays,
} from "@/features/routines/dashboardDayState";
import {
  addExerciseToDay,
  completeDaySession,
  getOrCreateDaySession,
  reopenDaySession,
  resetDaySession,
  resetExerciseSets,
  updateExerciseInDay,
  updateSetLogProgress,
} from "@/features/routines/actions/sessionActions";
import type {
  AddExerciseToDayInput,
  UpdateExerciseInDayInput,
} from "@/features/routines/actions/sessionActions";
import { notify } from "@/lib/notify";
import {
  buildRepsChangePatch,
  buildSetTogglePatch,
  bumpRevisionMap,
} from "@/features/routines/setProgress";
import type { SessionSavedNotice } from "@/features/routines/types";

export interface UseWorkoutSessionOptions {
  initialDays: TrainingDay[];
  routineId: string;
  initialDayId: string;
  initialSessionId: string | null;
  initialSessionCompleted?: boolean;
}

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
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );
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
    setSetRowRevision((prev) => bumpRevisionMap(prev, exerciseIds));
  };

  const getSelectedSessionId = (): string | null => {
    const sessionId = sessionIdsByDayId[selectedDayId];
    if (!sessionId) {
      notify.workout.notReady();
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

    const progressPatch = buildSetTogglePatch(currentSet);

    setDaysData((prev) => updateSetInDays(prev, setId, progressPatch));

    if (currentSessionId) {
      markSessionEditable(currentSessionId);
    }

    updateSetLogProgress(setId, progressPatch).then((result) => {
      if (!result.ok) {
        setDaysData((prev) =>
          updateSetInDays(prev, setId, {
            completed: currentSet.completed,
            actualReps: currentSet.actualReps,
          })
        );
        notify.workout.setUpdateFailed(result.error);
      }
    });
  };

  const handleRepsChange = (setId: string, reps: number | null) => {
    if (isReadOnly || !isUuid(setId)) return;

    setDaysData((prev) =>
      updateSetInDays(prev, setId, buildRepsChangePatch(reps))
    );

    if (currentSessionId) {
      markSessionEditable(currentSessionId);
    }
  };

  const handleRepsSave = (setId: string, reps: number | null) => {
    if (!isUuid(setId)) return;
    updateSetLogProgress(setId, buildRepsChangePatch(reps));
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
        prev.map((d) => (d.id === dayId ? result.mergedDay : d))
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
        notify.workout.exerciseResetFailed(result.error);
        return;
      }
      notify.workout.exerciseReset();
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
        notify.workout.dayResetFailed(result.error);
        return;
      }
      notify.workout.dayReset("live");
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
      notify.workout.workoutSaveFailed(result.error);
      return;
    }

    hasSavedOnceRef.current[sessionId] = true;
    setSavedNotice((prev) => ({
      ...prev,
      [sessionId]: isUpdate ? "updated" : "first",
    }));
    setCompletedSessionIds((prev) => ({ ...prev, [sessionId]: true }));
    notify.workout.workoutSaved(isUpdate, "live");
  };

  const handleAddExercise = async (input: AddExerciseToDayInput) => {
    const sessionId = getSelectedSessionId();
    if (!sessionId || isReadOnly) return;

    setIsAddingExercise(true);
    const result = await addExerciseToDay(selectedDayId, sessionId, input);
    setIsAddingExercise(false);

    if (!result.ok) {
      notify.workout.exerciseAddFailed(result.error);
      return;
    }

    setDaysData((prev) =>
      prev.map((day) =>
        day.id === selectedDayId
          ? appendExerciseToDay(day, result.exercise, result.setLogs)
          : day
      )
    );

    if (currentSessionId) {
      markSessionEditable(currentSessionId);
    }

    notify.workout.exerciseAdded(result.exercise.name);
  };

  const handleEditExercise = async (
    exerciseId: string,
    input: UpdateExerciseInDayInput
  ) => {
    const sessionId = getSelectedSessionId();
    if (!sessionId || isReadOnly) return;

    setEditingExerciseId(exerciseId);
    const result = await updateExerciseInDay(
      selectedDayId,
      sessionId,
      exerciseId,
      input
    );
    setEditingExerciseId(null);

    if (!result.ok) {
      notify.workout.exerciseUpdateFailed(result.error);
      return;
    }

    setDaysData((prev) =>
      prev.map((day) =>
        day.id === selectedDayId
          ? replaceExerciseInDay(day, result.exercise, result.setLogs)
          : day
      )
    );
    bumpSetRowRevision([exerciseId]);

    if (currentSessionId) {
      markSessionEditable(currentSessionId);
    }

    notify.workout.exerciseUpdated();
  };

  const handleEditWorkout = async () => {
    const sessionId = getSelectedSessionId();
    if (!sessionId) return;

    setIsReopening(true);
    const result = await reopenDaySession(sessionId);
    setIsReopening(false);

    if (!result.ok) {
      notify.workout.editWorkoutFailed(result.error);
      return;
    }

    markSessionEditable(sessionId);
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
    isPending,
    isSaving,
    isReopening,
    isResetting,
    isAddingExercise,
    editingExerciseId,
    setRowRevision,
    handleSelectDay,
    handleSetToggle,
    handleRepsChange,
    handleRepsSave,
    handleResetExercise,
    handleResetDay,
    handleSaveWorkout,
    handleEditWorkout,
    handleAddExercise,
    handleEditExercise,
  };
}
