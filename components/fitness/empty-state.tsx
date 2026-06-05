import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-4 py-12 text-center",
        className
      )}
    >
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
        {icon || <Inbox className="text-muted-foreground h-8 w-8" />}
      </div>

      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        {description}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        {primaryAction && (
          <Button
            type="button"
            onClick={primaryAction.onClick}
            className="min-h-11"
          >
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            type="button"
            variant="outline"
            onClick={secondaryAction.onClick}
            className="min-h-11"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
