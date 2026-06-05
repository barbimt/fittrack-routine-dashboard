import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function AnalyticsCard({
  title,
  children,
  className,
  action,
}: AnalyticsCardProps) {
  return (
    <div
      className={cn(
        "bg-card border-border rounded-2xl border p-5 shadow-sm",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-card-foreground text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

interface ChartPlaceholderProps {
  height?: string;
  label?: string;
}

export function ChartPlaceholder({
  height = "h-40",
  label,
}: ChartPlaceholderProps) {
  return (
    <div
      className={cn(
        "bg-muted/50 flex items-center justify-center rounded-xl",
        height
      )}
    >
      <span className="text-muted-foreground text-sm">
        {label || "Chart placeholder"}
      </span>
    </div>
  );
}
