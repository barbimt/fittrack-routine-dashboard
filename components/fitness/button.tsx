import { cn } from "@/lib/utils";
import { Button as UiButton } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof UiButton>;

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
