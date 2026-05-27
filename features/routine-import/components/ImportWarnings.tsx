import { AlertTriangle, Info } from "lucide-react";
import type { ImportWarning } from "../types";

const PREVIEW_LIMIT = 12;

interface ImportWarningsProps {
  warnings: ImportWarning[];
  title?: string;
}

export function ImportWarnings({ warnings, title = "Warnings" }: ImportWarningsProps) {
  if (warnings.length === 0) return null;

  const visible = warnings.slice(0, PREVIEW_LIMIT);
  const hiddenCount = warnings.length - visible.length;

  return (
    <section
      className="rounded-2xl border border-warning/30 bg-warning/5 p-4"
      aria-labelledby="import-warnings-title"
    >
      <h3
        id="import-warnings-title"
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden />
        {title}
        <span className="font-normal text-muted-foreground">({warnings.length})</span>
      </h3>
      <ul className="space-y-2">
        {visible.map((warning, index) => (
          <li
            key={`${warning.type}-${warning.sheetName ?? ""}-${warning.rowNumber ?? ""}-${index}`}
            className="flex items-start gap-2 text-sm text-foreground"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
            <span>{warning.message}</span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          And {hiddenCount} more warning{hiddenCount === 1 ? "" : "s"}.
        </p>
      )}
    </section>
  );
}
