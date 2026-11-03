import { muscleGroupLabel } from "@/features/routines/muscleGroups";
import {
  formatBestSet,
  formatCount,
  formatIsoDate,
  formatKg,
  formatPercentRatio,
  formatWeekStart,
} from "./format";
import { assignedMuscles, type ProgressDashboard } from "./schema";

function muscleLabel(slug: string): string {
  return (
    muscleGroupLabel(slug) ?? (slug === "unassigned" ? "Unassigned" : slug)
  );
}

function kpiLines(
  label: string,
  kpi: ProgressDashboard["kpis"]["recent"],
  previous: ProgressDashboard["kpis"]["previous"]
): string[] {
  return [
    `## ${label}`,
    `- Workouts: ${formatCount(kpi.workouts)} (previous ${formatCount(previous.workouts)})`,
    `- Hard sets: ${formatCount(kpi.hardSets)} (previous ${formatCount(previous.hardSets)})`,
    `- Tonnage: ${formatKg(kpi.tonnageKg)} (previous ${formatKg(previous.tonnageKg)})`,
    `- Training days: ${formatCount(kpi.trainingDays)} (previous ${formatCount(previous.trainingDays)})`,
    `- Adherence: ${formatPercentRatio(kpi.adherence)} (previous ${formatPercentRatio(previous.adherence)})`,
  ];
}

/** Markdown a person can paste into another model. Numbers come from the dashboard payload. */
export function buildProgressBrief(data: ProgressDashboard): string {
  const lines = [
    "You are a strength coach. Use only the facts below. Do not invent missing data. Say what is going well and what to change in the training.",
    "",
    "# Training progress",
    `Window: ${formatIsoDate(data.window.from)} to ${formatIsoDate(data.window.to)} (${data.window.weeks} weeks)`,
    `Comparison: last ${data.window.comparisonWeeks} weeks vs the ${data.window.comparisonWeeks} weeks before`,
    "Units: kilograms",
    "",
    "## Definitions",
    `- Hard set: ${data.definitions.hardSet}`,
    `- Tonnage: ${data.definitions.tonnageKg}`,
    `- Estimated 1RM: ${data.definitions.e1rmKg}`,
    `- Workout: ${data.definitions.workout}`,
    `- Adherence: ${data.definitions.adherence}`,
    `- Personal record: ${data.definitions.personalRecord}`,
    `- Load progress: ${data.definitions.loadProgress}`,
    "",
    "## Not tracked",
    ...data.notTracked.map((item) => `- ${item}`),
    "",
    "## Plan",
    `- Active routine days: ${formatCount(data.plan.activeRoutineDays)}`,
    `- Planned sessions in each comparison block: ${formatCount(data.plan.plannedSessions)}`,
    "",
    ...kpiLines("This period", data.kpis.recent, data.kpis.previous),
    "",
    "## Load progress",
    `- Improving: ${formatCount(data.loadProgress.improved)} of ${formatCount(data.loadProgress.tracked)} exercises with an estimated 1RM`,
    data.loadProgress.best
      ? `- Best gain: ${data.loadProgress.best.exerciseName}, +${formatKg(data.loadProgress.best.deltaKg)} estimated`
      : "- Best gain: none versus the previous period",
    "",
    "## Weekly totals",
    "| Week starting | Workouts | Hard sets | Tonnage |",
    "| --- | ---: | ---: | ---: |",
    ...data.weeks.map(
      (week) =>
        `| ${formatWeekStart(week.weekStart)} | ${formatCount(week.workouts)} | ${formatCount(week.hardSets)} | ${formatKg(week.tonnageKg)} |`
    ),
    "",
    "## Exercises",
    "| Exercise | Hard sets | Tonnage | Best estimated 1RM |",
    "| --- | ---: | ---: | ---: |",
    ...data.exercises.map(
      (exercise) =>
        `| ${exercise.name} | ${formatCount(exercise.hardSets)} | ${formatKg(exercise.tonnageKg)} | ${formatKg(exercise.bestE1rmKg)} |`
    ),
    "",
    "## Muscles",
    "| Muscle | Hard sets, last block | Hard sets, previous block |",
    "| --- | ---: | ---: |",
    ...assignedMuscles(data.muscles).map(
      (muscle) =>
        `| ${muscleLabel(muscle.muscleGroup)} | ${formatCount(muscle.recentHardSets)} | ${formatCount(muscle.previousHardSets)} |`
    ),
    "",
    "## Personal records",
    ...(data.personalRecords.length === 0
      ? ["- None in this window."]
      : data.personalRecords.map(
          (record) =>
            `- ${record.exerciseName} on ${formatIsoDate(record.sessionDate)}: ${formatBestSet(record.weightKg, record.reps)}, estimated 1RM ${formatKg(record.e1rmKg)}`
        )),
    "",
    "## Recent sessions",
  ];

  if (data.recentSessions.length === 0) {
    lines.push("- None in this window.");
  } else {
    for (const session of data.recentSessions) {
      lines.push(
        `### ${formatIsoDate(session.sessionDate)} — ${session.dayName} (${session.status})`,
        `Hard sets: ${formatCount(session.hardSets)}. Tonnage: ${formatKg(session.tonnageKg)}.`
      );
      for (const exercise of session.exercises) {
        lines.push(
          `- ${exercise.name}: ${formatCount(exercise.hardSets)} hard sets, best ${formatBestSet(exercise.bestWeightKg, exercise.bestReps)}`
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n").trim() + "\n";
}

export function buildProgressJson(data: ProgressDashboard): string {
  return JSON.stringify(data, null, 2);
}
