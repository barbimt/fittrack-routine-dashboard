"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Exercise } from "@/lib/mock-data";
import {
  formatCountdown,
  restTimeToSeconds,
} from "@/features/routines/restTime";
import { notify } from "@/lib/notify";

export type RestTimerState = {
  exerciseId: string;
  exerciseName: string;
  endsAt: number;
  totalSeconds: number;
  /** When paused, remaining seconds frozen here. */
  pausedRemaining: number | null;
};

export function useRestTimer() {
  const [timer, setTimer] = useState<RestTimerState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const finishedForRef = useRef<string | null>(null);

  const clear = useCallback(() => {
    finishedForRef.current = null;
    setTimer(null);
  }, []);

  const start = useCallback((exercise: Exercise) => {
    const totalSeconds = restTimeToSeconds(exercise.restTime);
    if (totalSeconds <= 0) return;

    finishedForRef.current = null;
    setTimer({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      endsAt: Date.now() + totalSeconds * 1000,
      totalSeconds,
      pausedRemaining: null,
    });
    setNow(Date.now());
  }, []);

  const pause = useCallback(() => {
    setTimer((current) => {
      if (!current || current.pausedRemaining !== null) return current;
      const remaining = Math.max(
        0,
        Math.ceil((current.endsAt - Date.now()) / 1000)
      );
      return { ...current, pausedRemaining: remaining };
    });
  }, []);

  const resume = useCallback(() => {
    setTimer((current) => {
      if (!current || current.pausedRemaining === null) return current;
      return {
        ...current,
        endsAt: Date.now() + current.pausedRemaining * 1000,
        pausedRemaining: null,
      };
    });
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!timer || timer.pausedRemaining !== null) return;

    const id = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);

      const remaining = Math.max(0, Math.ceil((timer.endsAt - tick) / 1000));
      if (remaining > 0) return;
      if (finishedForRef.current === timer.exerciseId) return;

      finishedForRef.current = timer.exerciseId;
      const exerciseName = timer.exerciseName;
      setTimer(null);
      notify.restComplete(exerciseName);
    }, 250);

    return () => window.clearInterval(id);
  }, [timer]);

  const remainingSeconds = timer
    ? timer.pausedRemaining !== null
      ? timer.pausedRemaining
      : Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
    : 0;

  const isRunning = Boolean(timer && timer.pausedRemaining === null);
  const isPaused = Boolean(timer && timer.pausedRemaining !== null);

  return {
    active: timer !== null,
    exerciseId: timer?.exerciseId ?? null,
    exerciseName: timer?.exerciseName ?? null,
    remainingSeconds,
    countdownLabel: formatCountdown(remainingSeconds),
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    clear,
  };
}
