import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function AnalyticsCard({ title, children, className, action }: AnalyticsCardProps) {
  return (
    <div className={cn("bg-card rounded-2xl border border-border p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
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

export function ChartPlaceholder({ height = "h-40", label }: ChartPlaceholderProps) {
  return (
    <div className={cn("flex items-center justify-center rounded-xl bg-muted/50", height)}>
      <span className="text-sm text-muted-foreground">{label || "Chart placeholder"}</span>
    </div>
  );
}
