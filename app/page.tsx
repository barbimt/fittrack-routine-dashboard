"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DaySelector } from "@/components/fitness/day-selector";
import { DailyProgressCard } from "@/components/fitness/daily-progress-card";
import { ExerciseCard } from "@/components/fitness/exercise-card";
import { SummaryPanel } from "@/components/fitness/summary-panel";
import { Button } from "@/components/fitness/button";
import {
  trainingDays,
  getCompletedSets,
  getTotalSets,
} from "@/lib/mock-data";
import { RotateCcw, Calendar } from "lucide-react";

export default function HomePage() {
  const [selectedDayId, setSelectedDayId] = useState("monday");
  const selectedDay =
    trainingDays.find((d) => d.id === selectedDayId) ?? trainingDays[0];
  const completedSets = getCompletedSets(selectedDay);
  const totalSets = getTotalSets(selectedDay);

  const weeklyCompleted = trainingDays.reduce(
    (sum, day) => sum + getCompletedSets(day),
    0
  );
  const weeklyTotal = trainingDays.reduce(
    (sum, day) => sum + getTotalSets(day),
    0
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" aria-hidden />
            <time dateTime={new Date().toISOString().split("T")[0]}>{today}</time>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Today&apos;s Workout
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track sets as you train — progress is based on completed sets, not reps.
          </p>
        </header>

        <section className="mb-6" aria-label="Training day selection">
          <DaySelector
            days={trainingDays}
            selectedDay={selectedDayId}
            onSelectDay={setSelectedDayId}
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
          <h2 className="text-lg font-semibold text-foreground">Exercises</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" type="button" className="text-muted-foreground">
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
              Reset exercise
            </Button>
            <Button variant="outline" size="sm" type="button">
              Reset day
            </Button>
          </div>
        </section>

        <section className="space-y-4" aria-label="Exercise list">
          {selectedDay.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSetToggle={() => undefined}
              onRepsChange={() => undefined}
            />
          ))}
        </section>
      </div>
    </AppShell>
  );
}
