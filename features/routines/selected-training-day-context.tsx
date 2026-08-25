"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SelectedDayByRoutine = Record<string, string>;

type SelectedTrainingDayContextValue = {
  getSelectedDayId: (routineId: string) => string | null;
  setSelectedDayId: (routineId: string, dayId: string) => void;
};

const SelectedTrainingDayContext =
  createContext<SelectedTrainingDayContextValue | null>(null);

export function SelectedTrainingDayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedByRoutine, setSelectedByRoutine] =
    useState<SelectedDayByRoutine>({});

  const getSelectedDayId = useCallback(
    (routineId: string) => selectedByRoutine[routineId] ?? null,
    [selectedByRoutine]
  );

  const setSelectedDayId = useCallback((routineId: string, dayId: string) => {
    setSelectedByRoutine((prev) =>
      prev[routineId] === dayId ? prev : { ...prev, [routineId]: dayId }
    );
  }, []);

  const value = useMemo(
    () => ({ getSelectedDayId, setSelectedDayId }),
    [getSelectedDayId, setSelectedDayId]
  );

  return (
    <SelectedTrainingDayContext.Provider value={value}>
      {children}
    </SelectedTrainingDayContext.Provider>
  );
}

export function useSelectedTrainingDay(): SelectedTrainingDayContextValue {
  const ctx = useContext(SelectedTrainingDayContext);
  if (!ctx) {
    throw new Error(
      "useSelectedTrainingDay must be used within SelectedTrainingDayProvider"
    );
  }
  return ctx;
}
