import { cn } from "@/lib/utils";
import type { TrainingDay } from "@/lib/mock-data";
import { getCompletedSets, getTotalSets } from "@/lib/mock-data";
import { ProgressBar } from "./progress-bar";
import { Badge } from "./badge";

interface SummaryPanelProps {
  selectedDay: TrainingDay;
  weeklyCompleted: number;
  weeklyTotal: number;
  className?: string;
}

export function SummaryPanel({
  selectedDay,
  weeklyCompleted,
  weeklyTotal,
  className,
}: SummaryPanelProps) {
  const dayCompleted = getCompletedSets(selectedDay);
  const dayTotal = getTotalSets(selectedDay);
  const muscleGroups = [
    ...new Set(selectedDay.exercises.map((e) => e.muscleGroup)),
  ];

  return (
    <aside
      className={cn("hidden w-72 shrink-0 space-y-4 xl:block", className)}
      aria-label="Workout summary"
    >
      <div className="sticky top-8 space-y-4">
        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            Today
          </p>
          <h2 className="text-card-foreground text-lg font-semibold">
            {selectedDay.dayName}
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            {selectedDay.focus}
          </p>
          <ProgressBar value={dayCompleted} max={dayTotal} size="md" />
          <p className="text-muted-foreground mt-2 text-sm">
            <span className="text-foreground font-semibold">
              {dayCompleted}
            </span>{" "}
            of {dayTotal} sets completed
          </p>
        </div>

        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <p className="text-card-foreground mb-3 text-sm font-semibold">
            Muscle focus
          </p>
          <div className="flex flex-wrap gap-1.5">
            {muscleGroups.map((group) => (
              <Badge key={group} variant="soft">
                {group}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-border bg-accent-soft/40 rounded-2xl border p-5">
          <p className="text-foreground mb-2 text-sm font-semibold">
            This week
          </p>
          <ProgressBar value={weeklyCompleted} max={weeklyTotal} size="sm" />
          <p className="text-muted-foreground mt-2 text-xs">
            {weeklyCompleted} / {weeklyTotal} sets across all days
          </p>
        </div>

        <div className="border-border bg-surface-muted/50 rounded-2xl border border-dashed p-4 text-center">
          <p className="text-muted-foreground text-xs">
            Prototype panel — wire live stats in Cursor
          </p>
        </div>
      </div>
    </aside>
  );
}
