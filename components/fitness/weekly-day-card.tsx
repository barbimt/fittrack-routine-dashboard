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

  // Get unique muscle groups
  const muscleGroups = [...new Set(day.exercises.map((e) => e.muscleGroup))];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-card rounded-2xl border border-border p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30",
        isToday && "ring-2 ring-primary/20 border-primary/40"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-card-foreground">{day.dayName}</h3>
            {isToday && (
              <Badge variant="default" className="text-xs">Today</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{day.focus}</p>
        </div>
        <div className="text-right">
          <span className={cn(
            "text-lg font-bold",
            isComplete ? "text-success" : "text-primary"
          )}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            isComplete ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Muscle Group Badges */}
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

      {/* Stats */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
        <span>{day.exercises.length} exercises</span>
        <span>{completed}/{total} sets</span>
      </div>
    </button>
  );
}
