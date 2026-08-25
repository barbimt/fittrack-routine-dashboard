import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning";
  className?: string;
}

const sizeClasses = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
} as const;

const variantClasses = {
  default:
    "[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary",
  success:
    "[&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success",
  warning:
    "[&::-webkit-progress-value]:bg-warning [&::-moz-progress-bar]:bg-warning",
} as const;

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  variant = "default",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      <progress
        value={value}
        max={max}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "bg-muted [&::-webkit-progress-bar]:bg-muted w-full appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-500",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {showLabel && (
        <p className="text-muted-foreground mt-1 text-sm">{percentage}%</p>
      )}
    </div>
  );
}
