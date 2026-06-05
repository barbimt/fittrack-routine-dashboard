import { cn } from "@/lib/utils";
import { Badge as UiBadge } from "@/components/ui/badge";

type FitnessBadgeVariant =
  | "default"
  | "soft"
  | "muscle"
  | "success"
  | "warning";

const variantClasses: Record<FitnessBadgeVariant, string> = {
  default: "",
  soft: "bg-accent-soft text-accent-foreground border-transparent hover:bg-accent-soft",
  muscle: "bg-surface-muted text-text-secondary border-border",
  success: "bg-success/10 text-success border-success/20 hover:bg-success/10",
  warning:
    "bg-warning/10 text-warning-foreground border-warning/30 hover:bg-warning/10",
};

export interface FitnessBadgeProps extends Omit<
  React.ComponentProps<typeof UiBadge>,
  "variant"
> {
  variant?: FitnessBadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: FitnessBadgeProps) {
  if (variant === "default") {
    return <UiBadge className={cn("font-medium", className)} {...props} />;
  }

  return (
    <UiBadge
      className={cn("border font-medium", variantClasses[variant], className)}
      {...props}
    />
  );
}
