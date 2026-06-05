"use client";

import { AppShell } from "@/components/app-shell";
import { DaySelector } from "@/components/fitness/day-selector";
import { DailyProgressCard } from "@/components/fitness/daily-progress-card";
import { ExerciseCard } from "@/components/fitness/exercise-card";
import { SummaryPanel } from "@/components/fitness/summary-panel";
import { WorkoutSavePanel } from "@/components/fitness/workout-save-panel";
import { Button } from "@/components/fitness/button";
import type { TrainingDay } from "@/lib/mock-data";
import { useWorkoutSession } from "@/hooks/use-workout-session";
import { Calendar, RotateCcw } from "lucide-react";

interface DashboardClientProps {
  days: TrainingDay[];
  routineName: string;
  routineId: string;
  initialDayId: string;
  initialSessionId: string | null;
  initialSessionCompleted?: boolean;
}

export function DashboardClient({
  days: initialDays,
  routineName,
  routineId,
  initialDayId,
  initialSessionId,
  initialSessionCompleted = false,
}: DashboardClientProps) {
  const workout = useWorkoutSession({
    initialDays,
    routineId,
    initialDayId,
    initialSessionId,
    initialSessionCompleted,
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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (!selectedDay) return null;

  return (
    <AppShell
      aside={
        <SummaryPanel
          selectedDay={selectedDay}
          weeklyCompleted={weeklyCompleted}
          weeklyTotal={weeklyTotal}
        />
      }
    >
      <div className="mx-auto max-w-4xl flex-1 px-4 py-6 pb-24 lg:px-0 lg:py-0 lg:pb-0">
        <header className="mb-6">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" aria-hidden />
            <time dateTime={new Date().toISOString().split("T")[0]}>
              {today}
            </time>
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
            onClick={handleResetDay}
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
              resetDisabled={isPending}
              setRowRevision={setRowRevision[exercise.id] ?? 0}
              readOnly={isReadOnly}
            />
          ))}
        </section>

        <WorkoutSavePanel
          isSessionSaved={isSessionSaved}
          sessionSavedNotice={sessionSavedNotice}
          isDayComplete={isDayComplete}
          completedSets={completedSets}
          totalSets={totalSets}
          canSaveWorkout={canSaveWorkout}
          isPending={isPending}
          isSaving={isSaving}
          isReopening={isReopening}
          isResetting={isResetting}
          onSave={handleSaveWorkout}
          onEdit={handleEditWorkout}
          onResetDay={handleResetDay}
        />
      </div>
    </AppShell>
  );
}
