import { cn } from "@/lib/utils";

interface DailyProgressCardProps {
  completed: number;
  total: number;
  dayName: string;
  focus: string;
}

export function DailyProgressCard({ completed, total, dayName, focus }: DailyProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">{dayName}</h2>
          <p className="text-sm text-muted-foreground">{focus}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="relative mb-3 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${completed} of ${total} sets completed`}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            percentage === 100 ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{completed}</span> of {total} sets completed
        </span>
        {percentage === 100 && (
          <span className="text-success font-medium">Complete</span>
        )}
      </div>
    </div>
  );
}
