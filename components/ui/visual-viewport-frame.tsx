import { cn } from "@/lib/utils";

export const visualViewportBoxClass =
  "top-[var(--vv-offset-top,0px)] h-[var(--vv-height,100dvh)]";

export function VisualViewportFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-slot="visual-viewport-frame"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center overflow-hidden px-4 py-3",
        visualViewportBoxClass
      )}
    >
      {children}
    </div>
  );
}

export const viewportPanelClassName =
  "pointer-events-auto relative my-auto w-full min-h-0 max-h-[calc(var(--vv-height,100dvh)-1.5rem)] max-w-lg";
