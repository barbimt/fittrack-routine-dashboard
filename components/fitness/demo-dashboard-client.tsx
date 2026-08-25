"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicAppShell } from "@/components/public-app-shell";
import { PageContent } from "@/components/layout/page-content";
import { DaySelector } from "@/components/fitness/day-selector";
import { DailyProgressCard } from "@/components/fitness/daily-progress-card";
import { ExerciseCard } from "@/components/fitness/exercise-card";
import { SummaryPanel } from "@/components/fitness/summary-panel";
import { WorkoutSavePanel } from "@/components/fitness/workout-save-panel";
import { ResetDayDialog } from "@/components/fitness/reset-day-dialog";
import { Button } from "@/components/fitness/button";
import { WorkoutRestTimerBar } from "@/components/fitness/rest-timer-bar";
import type { TrainingDay } from "@/lib/mock-data";
import {
  exerciseCardRestProps,
  restTimerPageClassName,
} from "@/features/routines/restTimerUi";
import { useDemoWorkoutSession } from "@/hooks/use-demo-workout-session";
import { useRestTimer } from "@/hooks/use-rest-timer";
import { useClientToday } from "@/hooks/use-client-today";
import { Calendar, RotateCcw, Sparkles } from "lucide-react";

interface DemoDashboardClientProps {
  days: TrainingDay[];
  routineName: string;
  initialDayId: string;
}

export function DemoDashboardClient({
  days,
  routineName,
  initialDayId,
}: DemoDashboardClientProps) {
  const [resetDayDialogOpen, setResetDayDialogOpen] = useState(false);
  const restTimer = useRestTimer();

  const workout = useDemoWorkoutSession({
    initialDays: days,
    initialDayId,
  });

  const {
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
  } = workout;

  const today = useClientToday();

  if (!selectedDay) return null;

  const requestResetDay = () => setResetDayDialogOpen(true);

  const confirmResetDay = () => {
    setResetDayDialogOpen(false);
    handleResetDay();
  };

  return (
    <PublicAppShell
      aside={
        <SummaryPanel
          selectedDay={selectedDay}
          weeklyCompleted={weeklyCompleted}
          weeklyTotal={weeklyTotal}
        />
      }
    >
      <PageContent className={restTimerPageClassName(restTimer.active)}>
        <div
          className="border-primary/20 bg-accent-soft mb-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex items-start gap-3">
            <Sparkles
              className="text-primary mt-0.5 h-5 w-5 shrink-0"
              aria-hidden
            />
            <div>
              <p className="text-foreground text-sm font-semibold">
                Sample week — no account needed
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                You can tick sets here, but nothing is stored. Sign up to use
                your own routine.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/signup">Create free account</Link>
          </Button>
        </div>

        <header className="mb-6">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" aria-hidden />
            <time dateTime={today?.iso}>{today?.label ?? "—"}</time>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Today&apos;s Workout
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{routineName}</p>
        </header>

        <section className="mb-6" aria-label="Training day selection">
          <DaySelector
            days={daysData}
            selectedDay={selectedDayId}
            onSelectDay={handleSelectDay}
          />
        </section>

        <section className="mb-6" aria-label="Daily progress">
          <DailyProgressCard
            completed={completedSets}
            total={totalSets}
            dayName={selectedDay.dayName}
            focus={selectedDay.focus}
          />
        </section>

        <section className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-foreground text-lg font-semibold">Exercises</h2>
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={
              isPending || completedSets === 0 || isReadOnly || isResetting
            }
            onMouseDown={(e) => e.preventDefault()}
            onClick={requestResetDay}
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            Reset day
          </Button>
        </section>

        <section
          className="space-y-4"
          aria-label="Exercise list"
          aria-busy={isPending}
        >
          {selectedDay.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSetToggle={handleSetToggle}
              onRepsChange={handleRepsChange}
              onRepsSave={handleRepsSave}
              onResetExercise={isReadOnly ? undefined : handleResetExercise}
              {...exerciseCardRestProps(restTimer, isReadOnly)}
              resetDisabled={isPending}
              setRowRevision={setRowRevision[exercise.id] ?? 0}
              readOnly={isReadOnly}
            />
          ))}
        </section>

        {isSessionSaved ? (
          <WorkoutSavePanel
            status="saved"
            sessionSavedNotice={sessionSavedNotice}
            busy={
              isPending
                ? "pending"
                : isReopening
                  ? "reopening"
                  : isResetting
                    ? "resetting"
                    : "idle"
            }
            onEdit={handleEditWorkout}
            onResetDay={requestResetDay}
          />
        ) : (
          <WorkoutSavePanel
            status="unsaved"
            progress={{
              completedSets,
              totalSets,
              dayComplete: isDayComplete,
              canSave: canSaveWorkout,
            }}
            busy={isPending ? "pending" : isSaving ? "saving" : "idle"}
            onSave={handleSaveWorkout}
          />
        )}

        <ResetDayDialog
          open={resetDayDialogOpen}
          onOpenChange={setResetDayDialogOpen}
          dayName={selectedDay.dayName}
          isResetting={isResetting}
          onConfirm={confirmResetDay}
        />
      </PageContent>

      <WorkoutRestTimerBar timer={restTimer} />
    </PublicAppShell>
  );
}
