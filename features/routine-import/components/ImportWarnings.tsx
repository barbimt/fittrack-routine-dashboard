import { AlertTriangle, Info } from "lucide-react";
import type { ImportWarning } from "../types";

const PREVIEW_LIMIT = 12;

interface ImportWarningsProps {
  warnings: ImportWarning[];
  title?: string;
}

export function ImportWarnings({
  warnings,
  title = "Warnings",
}: ImportWarningsProps) {
  if (warnings.length === 0) return null;

  const visible = warnings.slice(0, PREVIEW_LIMIT);
  const hiddenCount = warnings.length - visible.length;

  return (
    <section
      className="border-warning/30 bg-warning/5 rounded-2xl border p-4"
      aria-labelledby="import-warnings-title"
    >
      <h3
        id="import-warnings-title"
        className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold"
      >
        <AlertTriangle className="text-warning h-4 w-4 shrink-0" aria-hidden />
        {title}
        <span className="text-muted-foreground font-normal">
          ({warnings.length})
        </span>
      </h3>
      <ul className="space-y-2">
        {visible.map((warning, index) => (
          <li
            key={`${warning.type}-${warning.sheetName ?? ""}-${warning.rowNumber ?? ""}-${index}`}
            className="text-foreground flex items-start gap-2 text-sm"
          >
            <Info
              className="text-warning mt-0.5 h-4 w-4 shrink-0"
              aria-hidden
            />
            <span>{warning.message}</span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <p className="text-muted-foreground mt-2 text-sm">
          And {hiddenCount} more warning{hiddenCount === 1 ? "" : "s"}.
        </p>
      )}
    </section>
  );
}
