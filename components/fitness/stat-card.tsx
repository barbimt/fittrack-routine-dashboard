import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card border-border rounded-2xl border p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className="text-muted-foreground text-sm font-medium">
          {title}
        </span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-card-foreground text-2xl font-bold">{value}</span>
        {trend && (
          <span
            className={cn(
              "mb-0.5 text-sm font-medium",
              trend.positive ? "text-success" : "text-destructive"
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
      )}
    </div>
  );
}
