import { cn } from "@/lib/utils";
import type { TrainingDay } from "@/lib/mock-data";
import { getCompletedSets, getTotalSets } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

interface WeeklyDayCardProps {
  day: TrainingDay;
  isToday?: boolean;
  onClick?: () => void;
}

export function WeeklyDayCard({ day, isToday, onClick }: WeeklyDayCardProps) {
  const completed = getCompletedSets(day);
  const total = getTotalSets(day);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage === 100;

  const muscleGroups = [...new Set(day.exercises.map((e) => e.muscleGroup))];

  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-card border-border hover:border-primary/30 w-full rounded-2xl border p-4 text-left shadow-sm transition-all hover:shadow-md",
        isToday && "ring-primary/20 border-primary/40 ring-2"
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-card-foreground text-base font-semibold">
              {day.dayName}
            </h3>
            {isToday && (
              <Badge variant="default" className="text-xs">
                Today
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">{day.focus}</p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "text-lg font-bold",
              isComplete ? "text-success" : "text-primary"
            )}
          >
            {percentage}%
          </span>
        </div>
      </div>

      <div className="bg-muted relative mb-3 h-1.5 overflow-hidden rounded-full">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            isComplete ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {muscleGroups.slice(0, 3).map((group) => (
          <Badge key={group} variant="secondary" className="text-xs">
            {group}
          </Badge>
        ))}
        {muscleGroups.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{muscleGroups.length - 3}
          </Badge>
        )}
      </div>

      <div className="border-border text-muted-foreground mt-3 flex items-center justify-between border-t pt-3 text-sm">
        <span>{day.exercises.length} exercises</span>
        <span>
          {completed}/{total} sets
        </span>
      </div>
    </button>
  );
}
