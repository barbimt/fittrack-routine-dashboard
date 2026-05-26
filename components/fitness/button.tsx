import { cn } from "@/lib/utils";
import { Button as UiButton, type ButtonProps } from "@/components/ui/button";

/** FitTrack-styled button — min touch target on mobile */
export function Button({ className, size, ...props }: ButtonProps) {
  return (
    <UiButton
      className={cn(
        "rounded-xl font-medium shadow-none",
        size === "default" && "min-h-11",
        className
      )}
      size={size}
      {...props}
    />
  );
}
