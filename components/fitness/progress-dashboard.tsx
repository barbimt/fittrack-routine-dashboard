"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  Copy,
  Download,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
import { AnalyticsCard } from "@/components/fitness/analytics-card";
import { Button } from "@/components/fitness/button";
import { ProgressBar } from "@/components/fitness/progress-bar";
import { StatCard } from "@/components/fitness/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildProgressBrief,
  buildProgressJson,
} from "@/features/progress/brief";
import {
  formatBestSet,
  formatCount,
  formatIsoDate,
  formatKg,
  formatWeekStart,
  relativeChange,
} from "@/features/progress/format";
import {
  hasProgressData,
  assignedMuscles,
  type ProgressDashboard,
  type ProgressLoadResult,
} from "@/features/progress/schema";
import {
  progressMonthHref,
  type ProgressMonth,
} from "@/features/progress/range";
import { muscleGroupLabel } from "@/features/routines/muscleGroups";
import { cn } from "@/lib/utils";

const setsConfig = {
  hardSets: { label: "Hard sets", color: "var(--chart-1)" },
} satisfies ChartConfig;

const tonnageConfig = {
  tonnageKg: { label: "Reps × kg", color: "var(--chart-1)" },
} satisfies ChartConfig;

const strengthConfig = {
  e1rmKg: { label: "Estimated 1RM (kg)", color: "var(--chart-1)" },
} satisfies ChartConfig;

function muscleLabel(slug: string): string {
  return (
    muscleGroupLabel(slug) ?? (slug === "unassigned" ? "Unassigned" : slug)
  );
}

function downloadJson(data: ProgressDashboard) {
  const blob = new Blob([buildProgressJson(data)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `fittrack-progress-${data.window.to}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ProgressDashboardView({
  result,
  months = [],
  selectedFrom,
}: {
  result: ProgressLoadResult;
  months?: ProgressMonth[];
  selectedFrom?: string;
}) {
  return (
    <AppShell>
      <PageContent className="max-w-5xl">
        {result.ok ? (
          <ProgressBody
            data={result.data}
            months={months}
            selectedFrom={selectedFrom}
          />
        ) : (
          <ProgressMessage
            title="Progress is unavailable"
            body={result.error}
          />
        )}
      </PageContent>
    </AppShell>
  );
}

function ProgressBody({
  data,
  months,
  selectedFrom,
}: {
  data: ProgressDashboard;
  months: ProgressMonth[];
  selectedFrom?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copyFallback, setCopyFallback] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState(
    data.exercises[0]?.name ?? ""
  );

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyBrief() {
    const brief = buildProgressBrief(data);
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setCopyFallback(null);
    } catch {
      setCopied(false);
      setCopyFallback(brief);
    }
  }

  const recent = data.kpis.recent;
  const previous = data.kpis.previous;
  const exercise =
    data.exercises.find((item) => item.name === selectedExercise) ??
    data.exercises[0];
  const muscles = assignedMuscles(data.muscles);
  const muscleMax = Math.max(
    1,
    ...muscles.map((muscle) => muscle.recentHardSets)
  );

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-foreground mb-1 text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground">
            {formatIsoDate(data.window.from)} – {formatIsoDate(data.window.to)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void copyBrief()}
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copied ? "Copied" : "Copy report"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadJson(data)}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download JSON
          </Button>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-muted-foreground shrink-0 text-sm font-medium">
          From
        </span>
        <nav
          aria-label="Time range"
          className="min-w-0 flex-1 overflow-x-auto"
        >
          <div className="flex w-max gap-2 pb-1">
            {months.map((month) => {
              const current = selectedFrom
                ? selectedFrom.startsWith(month.id)
                : data.window.from.startsWith(month.id);
              return (
                <Link
                  key={month.id}
                  href={progressMonthHref(month.id)}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium",
                    current
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground"
                  )}
                >
                  {month.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {copyFallback && (
        <div className="mb-6">
          <p className="text-muted-foreground mb-2 text-sm">
            Could not copy automatically. Select the report and copy it.
          </p>
          <textarea
            readOnly
            value={copyFallback}
            aria-label="Training report"
            className="border-border bg-card text-card-foreground h-48 w-full rounded-xl border p-3 font-mono text-xs"
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}

      {hasProgressData(data) ? (
        <ProgressCharts
          data={data}
          recent={recent}
          previous={previous}
          exercise={exercise}
          muscles={muscles}
          muscleMax={muscleMax}
          selectedExercise={exercise?.name ?? ""}
          onSelectExercise={setSelectedExercise}
        />
      ) : (
        <ProgressMessage
          title="No completed sets yet"
          heading="h2"
          body="Finish a workout and mark the working sets. Warm-up sets stay out of these totals."
          action={
            <Button asChild>
              <Link href="/">Go to today</Link>
            </Button>
          }
        />
      )}
    </>
  );
}

function ProgressCharts({
  data,
  recent,
  previous,
  exercise,
  muscles,
  muscleMax,
  selectedExercise,
  onSelectExercise,
}: {
  data: ProgressDashboard;
  recent: ProgressDashboard["kpis"]["recent"];
  previous: ProgressDashboard["kpis"]["recent"];
  exercise: ProgressDashboard["exercises"][number] | undefined;
  muscles: ProgressDashboard["muscles"];
  muscleMax: number;
  selectedExercise: string;
  onSelectExercise: (name: string) => void;
}) {
  const strengthData =
    exercise?.weeklyBestE1rm.map((point) => ({
      week: formatWeekStart(point.weekStart),
      e1rmKg: point.e1rmKg,
    })) ?? [];
  const hasStrength = strengthData.some((point) => point.e1rmKg != null);

  return (
    <>
      <section className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Compliance"
          value={
            data.plan.plannedSessions > 0
              ? `${formatCount(recent.workouts)}/${formatCount(data.plan.plannedSessions)}`
              : formatCount(recent.workouts)
          }
          subtitle={
            data.plan.plannedSessions > 0
              ? `Sessions your ${formatCount(data.plan.activeRoutineDays)}-day routine schedules`
              : "This period"
          }
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Improving"
          value={
            data.loadProgress.tracked > 0
              ? `${formatCount(data.loadProgress.improved)}/${formatCount(data.loadProgress.tracked)}`
              : "—"
          }
          subtitle="Higher estimated strength than the previous period"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Volume"
          value={formatKg(recent.tonnageKg)}
          subtitle="Reps × kg on working sets"
          icon={<Award className="h-4 w-4" />}
          trend={relativeChange(recent.tonnageKg, previous.tonnageKg)}
        />
        <StatCard
          title="Effective sets"
          value={formatCount(recent.hardSets)}
          subtitle="Completed sets, warm-ups excluded"
          icon={<Target className="h-4 w-4" />}
          trend={relativeChange(recent.hardSets, previous.hardSets)}
        />
      </section>
      {data.loadProgress.best && (
        <p className="text-muted-foreground mb-8 text-sm">
          Best gain: +{formatKg(data.loadProgress.best.deltaKg)} estimated ·{" "}
          {data.loadProgress.best.exerciseName}. More reps at the same weight
          counts as progress.
        </p>
      )}

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsCard title="Hard sets by week">
          <ChartContainer
            config={setsConfig}
            className="aspect-auto h-52 w-full"
          >
            <BarChart
              data={data.weeks.map((week) => ({
                week: formatWeekStart(week.weekStart),
                hardSets: week.hardSets,
              }))}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis
                allowDecimals={false}
                width={32}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="hardSets" fill="var(--color-hardSets)" radius={4} />
            </BarChart>
          </ChartContainer>
        </AnalyticsCard>

        <AnalyticsCard title="Work by week">
          <p className="text-muted-foreground mb-3 text-sm">
            Reps times kilograms for the whole week. It is not the weight of one
            lift.
          </p>
          <ChartContainer
            config={tonnageConfig}
            className="aspect-auto h-52 w-full"
          >
            <LineChart
              data={data.weeks.map((week) => ({
                week: formatWeekStart(week.weekStart),
                tonnageKg: week.tonnageKg,
              }))}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis width={40} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="tonnageKg"
                stroke="var(--color-tonnageKg)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </AnalyticsCard>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsCard title="Hard sets by muscle">
          <p className="text-muted-foreground mb-3 text-sm">
            Working sets for each exercise’s main muscle. The number beside the
            bar is the change versus the previous period.
          </p>
          <div className="space-y-4">
            {muscles.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No muscle groups logged yet.
              </p>
            ) : (
              muscles.map((muscle) => {
                const delta = muscle.recentHardSets - muscle.previousHardSets;
                return (
                  <div key={muscle.muscleGroup}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-card-foreground text-sm font-medium">
                        {muscleLabel(muscle.muscleGroup)}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-2 text-sm">
                        {formatCount(muscle.recentHardSets)}
                        {delta !== 0 && (
                          <Badge variant={delta > 0 ? "default" : "secondary"}>
                            {delta > 0 ? "+" : ""}
                            {delta}
                          </Badge>
                        )}
                      </span>
                    </div>
                    <ProgressBar
                      value={muscle.recentHardSets}
                      max={muscleMax}
                      size="sm"
                    />
                  </div>
                );
              })
            )}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Personal records">
          <p className="text-muted-foreground mb-3 text-sm">
            A new best estimated one-rep max for that exercise.
          </p>
          <div className="space-y-3">
            {data.personalRecords.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Log weight and 1–12 reps to estimate a one-rep max.
              </p>
            ) : (
              data.personalRecords.map((record) => (
                <div
                  key={`${record.exerciseName}-${record.sessionDate}-${record.e1rmKg}`}
                  className="bg-success/5 border-success/20 flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="text-card-foreground text-sm font-medium">
                      {record.exerciseName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatIsoDate(record.sessionDate)} ·{" "}
                      {formatBestSet(record.weightKg, record.reps)}
                    </p>
                  </div>
                  <span className="text-success text-sm font-semibold">
                    {formatKg(record.e1rmKg)}
                  </span>
                </div>
              ))
            )}
          </div>
        </AnalyticsCard>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsCard title="One exercise">
          <p className="text-muted-foreground mb-3 text-sm">
            Estimated one-rep max for the exercise you pick. It only appears
            when that week has a logged weight and 1–12 reps.
          </p>
          {data.exercises.length > 0 && (
            <Select value={selectedExercise} onValueChange={onSelectExercise}>
              <SelectTrigger className="mb-4 w-full" aria-label="Exercise">
                <SelectValue placeholder="Exercise" />
              </SelectTrigger>
              <SelectContent>
                {data.exercises.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {exercise == null ? (
            <p className="text-muted-foreground text-sm">
              No exercises in this period.
            </p>
          ) : hasStrength ? (
            <ChartContainer
              config={strengthConfig}
              className="aspect-auto h-56 w-full"
            >
              <LineChart data={strengthData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                />
                <YAxis width={40} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="e1rmKg"
                  stroke="var(--color-e1rmKg)"
                  strokeWidth={2}
                  connectNulls={false}
                  dot
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-sm">
              {exercise.name} has no estimated 1RM in this period. Log the
              weight and 1–12 reps.
            </p>
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Work by exercise">
          <ExerciseWorkChart exercises={data.exercises} />
        </AnalyticsCard>
      </section>
    </>
  );
}

function ExerciseWorkChart({
  exercises,
}: {
  exercises: ProgressDashboard["exercises"];
}) {
  const weighted = exercises.filter((item) => item.tonnageKg > 0);
  const unweighted = exercises.length - weighted.length;
  const work = [...weighted].sort((a, b) => a.tonnageKg - b.tonnageKg);

  if (exercises.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No exercises in this period.
      </p>
    );
  }

  if (work.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        These exercises were logged without weight, so there is no work to
        chart.
      </p>
    );
  }

  return (
    <>
      <p className="text-muted-foreground mb-3 text-sm">
        Longer bar means more reps × kg in this period. Compare a lift with
        itself later, not a machine with a dumbbell.
      </p>
      <ChartContainer
        config={tonnageConfig}
        className="aspect-auto w-full"
        style={{ height: Math.max(200, work.length * 40) }}
      >
        <BarChart
          data={work}
          layout="vertical"
          margin={{ left: 4, right: 8 }}
          accessibilityLayer
        >
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={132}
            tickLine={false}
            axisLine={false}
            interval={0}
            tickFormatter={(value: string) =>
              value.length > 18 ? `${value.slice(0, 16)}…` : value
            }
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="tonnageKg" fill="var(--color-tonnageKg)" radius={4} />
        </BarChart>
      </ChartContainer>
      {unweighted > 0 && (
        <p className="text-muted-foreground mt-3 text-sm">
          {formatCount(unweighted)}{" "}
          {unweighted === 1 ? "exercise" : "exercises"} logged without weight,
          so {unweighted === 1 ? "it is" : "they are"} not on this chart.
        </p>
      )}
    </>
  );
}

function ProgressMessage({
  title,
  body,
  action,
  heading = "h1",
}: {
  title: string;
  body: string;
  action?: ReactNode;
  heading?: "h1" | "h2";
}) {
  const Title = heading;
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Title className="text-foreground mb-2 text-2xl font-bold">{title}</Title>
      <p className="text-muted-foreground mb-6">{body}</p>
      {action}
    </div>
  );
}
