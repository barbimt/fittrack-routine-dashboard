"use client";

import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/fitness/stat-card";
import { AnalyticsCard, ChartPlaceholder } from "@/components/fitness/analytics-card";
import { ProgressBar } from "@/components/fitness/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Target,
  Award,
  Calendar,
  ChevronRight,
} from "lucide-react";

// Mock personal records
const personalRecords = [
  { exercise: "Hip Thrust", weight: "70kg", date: "May 15" },
  { exercise: "Lat Pulldown", weight: "40kg", date: "May 10" },
  { exercise: "Leg Press", weight: "100kg", date: "May 8" },
];

// Mock muscle group data
const muscleGroupVolume = [
  { name: "Glutes", sets: 52, change: 8 },
  { name: "Back", sets: 28, change: 4 },
  { name: "Quads", sets: 24, change: -2 },
  { name: "Core", sets: 18, change: 6 },
  { name: "Arms", sets: 16, change: 0 },
];

export default function ProgressPage() {
  return (
    <AppShell>
      <div className="px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey over time</p>
        </header>

        {/* Weekly volume highlight */}
        <section className="mb-8">
          <AnalyticsCard title="Weekly volume">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-3xl font-bold text-card-foreground">142</p>
                <p className="text-sm text-muted-foreground">Sets completed this week</p>
              </div>
              <ChartPlaceholder height="h-24 sm:h-20 sm:flex-1 sm:max-w-md" label="Bar chart placeholder" />
            </div>
          </AnalyticsCard>
        </section>

        {/* Top Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Volume"
            value="1,240"
            subtitle="Sets this month"
            icon={<Target className="h-4 w-4" />}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Workouts"
            value="18"
            subtitle="Completed this month"
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Consistency"
            value="92%"
            subtitle="This month"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ value: 7, positive: true }}
          />
          <StatCard
            title="PRs Set"
            value="5"
            subtitle="This month"
            icon={<Award className="h-4 w-4" />}
          />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <AnalyticsCard
            title="Weekly Volume Trend"
            action={
              <Button variant="ghost" size="sm" className="text-xs">
                View Details
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            <ChartPlaceholder height="h-48" label="Line chart: Weekly sets over time" />
          </AnalyticsCard>

          <AnalyticsCard
            title="Training Frequency"
            action={
              <Button variant="ghost" size="sm" className="text-xs">
                View Details
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            <ChartPlaceholder height="h-48" label="Bar chart: Days trained per week" />
          </AnalyticsCard>
        </section>

        {/* Muscle Group Volume */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <AnalyticsCard title="Volume by Muscle Group">
            <div className="space-y-4">
              {muscleGroupVolume.map((group) => (
                <div key={group.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-card-foreground">{group.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{group.sets} sets</span>
                      {group.change !== 0 && (
                        <Badge
                          variant={group.change > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {group.change > 0 ? "+" : ""}{group.change}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ProgressBar
                    value={group.sets}
                    max={Math.max(...muscleGroupVolume.map((g) => g.sets))}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </AnalyticsCard>

          {/* Personal Records */}
          <AnalyticsCard
            title="Recent Personal Records"
            action={
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            <div className="space-y-3">
              {personalRecords.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10">
                      <Award className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{record.exercise}</p>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-success">{record.weight}</span>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </section>

        {/* Progress Trend Placeholder */}
        <AnalyticsCard
          title="Strength Progress Over Time"
          action={
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs cursor-pointer">Hip Thrust</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer">Lat Pulldown</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer">Leg Press</Badge>
            </div>
          }
        >
          <ChartPlaceholder height="h-64" label="Line chart: Weight progression per exercise" />
        </AnalyticsCard>
      </div>
    </AppShell>
  );
}
