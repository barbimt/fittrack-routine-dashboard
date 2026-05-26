import { cn } from "@/lib/utils";
import { Input as UiInput } from "@/components/ui/input";

export interface FitnessInputProps extends React.ComponentProps<typeof UiInput> {}

/** Editable-looking field for workout prototype */
export function Input({ className, ...props }: FitnessInputProps) {
  return (
    <UiInput
      className={cn(
        "h-10 rounded-lg border-border bg-background text-foreground",
        "focus-visible:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}
