import { cn } from "@/lib/utils";

export const visualViewportBoxClass =
  "top-[var(--vv-offset-top,0px)] h-[var(--vv-height,100dvh)]";

export function VisualViewportFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="visual-viewport-frame"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center overflow-hidden px-4 py-3",
        visualViewportBoxClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export const viewportPanelClassName =
  "pointer-events-auto relative w-full min-h-0 max-w-lg";

export const viewportPanelCenterClass =
  "my-auto max-h-[calc(var(--vv-height,100dvh)-1.5rem)]";
