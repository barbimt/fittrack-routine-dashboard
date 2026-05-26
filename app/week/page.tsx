"use client";

import { AppShell } from "@/components/app-shell";
import { WeeklyDayCard } from "@/components/fitness/weekly-day-card";
import { StatCard } from "@/components/fitness/stat-card";
import { ProgressBar } from "@/components/fitness/progress-bar";
import { trainingDays, weeklyStats, getCompletedSets, getTotalSets } from "@/lib/mock-data";
import { Calendar, Target, TrendingUp, Flame } from "lucide-react";

export default function WeekOverviewPage() {
  const totalCompleted = trainingDays.reduce((sum, day) => sum + getCompletedSets(day), 0);
  const totalPlanned = trainingDays.reduce((sum, day) => sum + getTotalSets(day), 0);
  const weeklyPercentage = Math.round((totalCompleted / totalPlanned) * 100);

  // Calculate training days completed
  const daysWithProgress = trainingDays.filter((day) => getCompletedSets(day) > 0).length;

  return (
    <AppShell>
      <div className="px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Week Overview</h1>
          <p className="text-muted-foreground">Track your weekly training progress</p>
        </header>

        {/* Weekly Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Weekly Progress"
            value={`${weeklyPercentage}%`}
            subtitle={`${totalCompleted} of ${totalPlanned} sets`}
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard
            title="Training Days"
            value={`${daysWithProgress}/${trainingDays.length}`}
            subtitle="Days with activity"
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Consistency"
            value="85%"
            subtitle="Last 4 weeks"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ value: 5, positive: true }}
          />
          <StatCard
            title="Current Streak"
            value="3 days"
            subtitle="Keep it up!"
            icon={<Flame className="h-4 w-4" />}
          />
        </section>

        {/* Weekly Progress Bar */}
        <section className="bg-card rounded-2xl border border-border p-5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-card-foreground">This Week</h2>
            <span className="text-sm text-muted-foreground">
              {totalCompleted} / {totalPlanned} sets
            </span>
          </div>
          <ProgressBar value={totalCompleted} max={totalPlanned} size="lg" />
        </section>

        {/* Training Days Grid */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Training Days</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingDays.map((day, index) => (
              <WeeklyDayCard
                key={day.id}
                day={day}
                isToday={index === 0}
              />
            ))}
          </div>
        </section>

        {/* Weekly consistency */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Consistency</h2>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">4-week training habit</p>
              <span className="text-lg font-bold text-primary">85%</span>
            </div>
            <ProgressBar value={85} max={100} size="lg" />
            <p className="mt-3 text-sm text-muted-foreground">
              You trained <span className="font-semibold text-foreground">17 of 20</span> planned
              days in the last 4 weeks.
            </p>
          </div>
        </section>

        {/* Muscle Group Distribution */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Muscle Group Focus</h2>
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="space-y-4">
              {weeklyStats.muscleGroups.map((group) => (
                <div key={group.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-card-foreground">{group.name}</span>
                    <span className="text-sm text-muted-foreground">{group.sets} sets</span>
                  </div>
                  <ProgressBar
                    value={group.sets}
                    max={Math.max(...weeklyStats.muscleGroups.map((g) => g.sets))}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
