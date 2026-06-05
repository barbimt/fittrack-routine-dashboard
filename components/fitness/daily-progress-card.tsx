import { cn } from "@/lib/utils";

interface DailyProgressCardProps {
  completed: number;
  total: number;
  dayName: string;
  focus: string;
}

export function DailyProgressCard({
  completed,
  total,
  dayName,
  focus,
}: DailyProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-card-foreground text-lg font-semibold">
            {dayName}
          </h2>
          <p className="text-muted-foreground text-sm">{focus}</p>
        </div>
        <div className="text-right">
          <span className="text-primary text-2xl font-bold">{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="bg-muted relative mb-3 h-2 overflow-hidden rounded-full"
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
          <span className="text-foreground font-semibold">{completed}</span> of{" "}
          {total} sets completed
        </span>
        {percentage === 100 && (
          <span className="text-success font-medium">Complete</span>
        )}
      </div>
    </div>
  );
}
