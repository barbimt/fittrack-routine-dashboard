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
  const muscleGroups = [...new Set(selectedDay.exercises.map((e) => e.muscleGroup))];

  return (
    <aside
      className={cn(
        "hidden xl:block w-72 shrink-0 space-y-4",
        className
      )}
      aria-label="Workout summary"
    >
      <div className="sticky top-8 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Today
          </p>
          <h2 className="text-lg font-semibold text-card-foreground">{selectedDay.dayName}</h2>
          <p className="text-sm text-muted-foreground mb-4">{selectedDay.focus}</p>
          <ProgressBar value={dayCompleted} max={dayTotal} size="md" />
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{dayCompleted}</span> of{" "}
            {dayTotal} sets completed
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-card-foreground mb-3">Muscle focus</p>
          <div className="flex flex-wrap gap-1.5">
            {muscleGroups.map((group) => (
              <Badge key={group} variant="soft">
                {group}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-accent-soft/40 p-5">
          <p className="text-sm font-semibold text-foreground mb-2">This week</p>
          <ProgressBar value={weeklyCompleted} max={weeklyTotal} size="sm" />
          <p className="mt-2 text-xs text-muted-foreground">
            {weeklyCompleted} / {weeklyTotal} sets across all days
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Prototype panel — wire live stats in Cursor
          </p>
        </div>
      </div>
    </aside>
  );
}
