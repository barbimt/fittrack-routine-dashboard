import { cn } from "@/lib/utils";

const PAGE_WIDTH = {
  lg: "max-w-lg",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
} as const;

export type PageWidth = keyof typeof PAGE_WIDTH;

export interface PageContentProps {
  children: React.ReactNode;
  /** Content max width — default `4xl` */
  width?: PageWidth;
  className?: string;
}

/** Shared page padding and max-width for routes inside `AppShell`. */
export function pageContentClassName(
  width: PageWidth = "4xl",
  className?: string
): string {
  return cn("mx-auto px-4 py-6 lg:px-8 lg:py-8", PAGE_WIDTH[width], className);
}

export function PageContent({
  children,
  width = "4xl",
  className,
}: PageContentProps) {
  return (
    <div className={pageContentClassName(width, className)}>{children}</div>
  );
}
