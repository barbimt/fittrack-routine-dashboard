"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  createNewId,
  type EditorDay,
  type EditorExercise,
  type EditorRoutine,
} from "@/features/routines/editorTypes";
import {
  computeRoutinePatch,
  isEmptyPatch,
} from "@/features/routines/routinePatch";
import {
  validateRoutineDays,
  type DayValidationError,
} from "@/features/routines/editorSchema";
import { updateRoutine } from "@/features/routines/actions/routineActions";
import { useDirtyState } from "./use-dirty-state";

function reorder<T extends { id: string }>(
  items: T[],
  event: DragEndEvent
): T[] {
  const { active, over } = event;
  if (!over || active.id === over.id) return items;
  const oldIndex = items.findIndex((item) => item.id === active.id);
  const newIndex = items.findIndex((item) => item.id === over.id);
  if (oldIndex < 0 || newIndex < 0) return items;
  return arrayMove(items, oldIndex, newIndex);
}

/**
 * Owns all editor state: the working copy of days, dirty tracking against the
 * last-saved baseline, validation, and the patch-based save. UI components stay
 * presentational and only call the returned actions.
 */
export function useRoutineEditor(routine: EditorRoutine) {
  const router = useRouter();

  // Editable draft of the routine's days plus dirty tracking against the last
  // server-provided baseline (re-seeded after a save + refresh).
  const {
    value: days,
    setValue: setDays,
    baseline,
    isDirty,
  } = useDirtyState(routine.days);

  const [expandedDayId, setExpandedDayId] = useState<string | null>(
    routine.days[0]?.id ?? null
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dayErrors, setDayErrors] = useState<DayValidationError[]>([]);

  const mutate = useCallback(
    (updater: (prev: EditorDay[]) => EditorDay[]) => {
      setSaveError(null);
      setSaved(false);
      setDayErrors([]);
      setDays(updater);
    },
    [setDays]
  );

  const mutateDay = useCallback(
    (dayId: string, updater: (day: EditorDay) => EditorDay) => {
      mutate((prev) => prev.map((d) => (d.id === dayId ? updater(d) : d)));
    },
    [mutate]
  );

  const toggleDay = useCallback((dayId: string) => {
    setExpandedDayId((current) => (current === dayId ? null : dayId));
  }, []);

  const updateDay = useCallback(
    (dayId: string, patch: Partial<EditorDay>) => {
      mutateDay(dayId, (day) => ({ ...day, ...patch }));
    },
    [mutateDay]
  );

  const deleteDay = useCallback(
    (dayId: string) => {
      mutate((prev) => prev.filter((d) => d.id !== dayId));
    },
    [mutate]
  );

  const addDay = useCallback(() => {
    const newDay: EditorDay = {
      id: createNewId(),
      name: "New day",
      focus: null,
      originalName: "New day",
      sortOrder: 0,
      exercises: [],
    };
    mutate((prev) => [...prev, newDay]);
    setExpandedDayId(newDay.id);
  }, [mutate]);

  const updateExercise = useCallback(
    (dayId: string, exerciseId: string, patch: Partial<EditorExercise>) => {
      mutateDay(dayId, (day) => ({
        ...day,
        exercises: day.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, ...patch } : ex
        ),
      }));
    },
    [mutateDay]
  );

  const deleteExercise = useCallback(
    (dayId: string, exerciseId: string) => {
      mutateDay(dayId, (day) => ({
        ...day,
        exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
      }));
    },
    [mutateDay]
  );

  const addExercise = useCallback(
    (dayId: string) => {
      mutateDay(dayId, (day) => ({
        ...day,
        exercises: [
          ...day.exercises,
          {
            id: createNewId(),
            name: "New exercise",
            muscleGroup: null,
            prescription: "3x12",
            plannedSets: 3,
            targetReps: "12",
            weight: null,
            restTime: null,
            notes: null,
            sortOrder: day.exercises.length,
          },
        ],
      }));
    },
    [mutateDay]
  );

  const reorderDays = useCallback(
    (event: DragEndEvent) => {
      mutate((prev) => reorder(prev, event));
    },
    [mutate]
  );

  const reorderExercises = useCallback(
    (dayId: string, event: DragEndEvent) => {
      mutateDay(dayId, (day) => ({
        ...day,
        exercises: reorder(day.exercises, event),
      }));
    },
    [mutateDay]
  );

  const save = useCallback(async () => {
    setSaveError(null);
    setSaved(false);

    const validationErrors = validateRoutineDays(days);
    if (validationErrors.length > 0) {
      setDayErrors(validationErrors);
      setExpandedDayId(validationErrors[0].dayId);
      return;
    }
    setDayErrors([]);

    setSaving(true);
    const patch = computeRoutinePatch(routine.id, baseline, days);

    if (isEmptyPatch(patch)) {
      setSaved(true);
      setSaving(false);
      return;
    }

    const result = await updateRoutine(patch);
    if (result.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setSaveError(result.error);
    }
    setSaving(false);
  }, [baseline, days, routine.id, router]);

  const dayErrorsById = useMemo(
    () => new Map(dayErrors.map((error) => [error.dayId, error.messages])),
    [dayErrors]
  );

  return {
    days,
    expandedDayId,
    isDirty,
    saving,
    saved,
    saveError,
    dayErrors,
    dayErrorsById,
    toggleDay,
    updateDay,
    deleteDay,
    addDay,
    updateExercise,
    deleteExercise,
    addExercise,
    reorderDays,
    reorderExercises,
    save,
  };
}
