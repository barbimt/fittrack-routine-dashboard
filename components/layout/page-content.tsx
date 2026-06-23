import { cn } from "@/lib/utils";

export interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

/** Shared page shell: centered content, default `max-w-4xl`, responsive padding. Override width via `className` (e.g. `max-w-5xl`). */
export function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={cn("mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8", className)}
    >
      {children}
    </div>
  );
}
