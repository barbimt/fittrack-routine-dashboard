"use client";

import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
import { StatCard } from "@/components/fitness/stat-card";
import {
  AnalyticsCard,
  ChartPlaceholder,
} from "@/components/fitness/analytics-card";
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

const personalRecords = [
  { exercise: "Hip Thrust", weight: "70kg", date: "May 15" },
  { exercise: "Lat Pulldown", weight: "40kg", date: "May 10" },
  { exercise: "Leg Press", weight: "100kg", date: "May 8" },
];

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
      <PageContent width="5xl">
        <header className="mb-6">
          <h1 className="text-foreground mb-1 text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground">
            Track your fitness journey over time
          </p>
        </header>

        <section className="mb-8">
          <AnalyticsCard title="Weekly volume">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-card-foreground text-3xl font-bold">142</p>
                <p className="text-muted-foreground text-sm">
                  Sets completed this week
                </p>
              </div>
              <ChartPlaceholder
                height="h-24 sm:h-20 sm:flex-1 sm:max-w-md"
                label="Bar chart placeholder"
              />
            </div>
          </AnalyticsCard>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnalyticsCard
            title="Weekly Volume Trend"
            action={
              <Button variant="ghost" size="sm" className="text-xs">
                View Details
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            }
          >
            <ChartPlaceholder
              height="h-48"
              label="Line chart: Weekly sets over time"
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Training Frequency"
            action={
              <Button variant="ghost" size="sm" className="text-xs">
                View Details
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            }
          >
            <ChartPlaceholder
              height="h-48"
              label="Bar chart: Days trained per week"
            />
          </AnalyticsCard>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnalyticsCard title="Volume by Muscle Group">
            <div className="space-y-4">
              {muscleGroupVolume.map((group) => (
                <div key={group.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-card-foreground text-sm font-medium">
                      {group.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        {group.sets} sets
                      </span>
                      {group.change !== 0 && (
                        <Badge
                          variant={group.change > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {group.change > 0 ? "+" : ""}
                          {group.change}
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

          <AnalyticsCard
            title="Recent Personal Records"
            action={
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            }
          >
            <div className="space-y-3">
              {personalRecords.map((record, index) => (
                <div
                  key={index}
                  className="bg-success/5 border-success/20 flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 flex h-8 w-8 items-center justify-center rounded-full">
                      <Award className="text-success h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-card-foreground text-sm font-medium">
                        {record.exercise}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {record.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-success text-sm font-semibold">
                    {record.weight}
                  </span>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </section>

        <AnalyticsCard
          title="Strength Progress Over Time"
          action={
            <div className="flex gap-2">
              <Badge variant="secondary" className="cursor-pointer text-xs">
                Hip Thrust
              </Badge>
              <Badge variant="outline" className="cursor-pointer text-xs">
                Lat Pulldown
              </Badge>
              <Badge variant="outline" className="cursor-pointer text-xs">
                Leg Press
              </Badge>
            </div>
          }
        >
          <ChartPlaceholder
            height="h-64"
            label="Line chart: Weight progression per exercise"
          />
        </AnalyticsCard>
      </PageContent>
    </AppShell>
  );
}
