import { FileSpreadsheet } from "lucide-react";
import type { ParsedRoutine } from "../types";
import { ImportDayExercises } from "./ImportDayExercises";
import { ImportWarnings } from "./ImportWarnings";

interface ImportPreviewProps {
  fileName: string;
  fileSize: number;
  routine: ParsedRoutine;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportPreview({
  fileName,
  fileSize,
  routine,
}: ImportPreviewProps) {
  const totalExercises = routine.days.reduce(
    (sum, day) => sum + day.exercises.length,
    0
  );

  return (
    <section className="space-y-6" aria-labelledby="routine-preview-title">
      <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <FileSpreadsheet className="text-primary h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="routine-preview-title"
              className="text-foreground text-lg font-semibold"
            >
              Routine preview
            </h2>
            <p className="text-foreground text-base font-medium">
              {routine.name}
            </p>
            <p className="text-muted-foreground mt-1 truncate text-sm">
              {fileName} · {formatFileSize(fileSize)}
            </p>
            <p className="text-foreground mt-3 text-sm">
              <span className="font-medium">{routine.days.length}</span>{" "}
              {routine.days.length === 1 ? "day" : "days"} found ·{" "}
              <span className="font-medium">{totalExercises}</span>{" "}
              {totalExercises === 1 ? "exercise" : "exercises"} found
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-4" aria-label="Imported routine days">
        {routine.days.map((day) => (
          <li
            key={`${day.originalName}-${day.sortOrder}`}
            className="border-border bg-card rounded-2xl border p-4 shadow-sm"
          >
            <div className="mb-3">
              <p className="text-foreground font-medium">{day.originalName}</p>
              <p className="text-muted-foreground text-sm">
                {day.exercises.length}{" "}
                {day.exercises.length === 1 ? "exercise" : "exercises"}
                {day.focus ? ` · ${day.focus}` : ""}
              </p>
            </div>
            <ImportDayExercises
              exercises={day.exercises}
              dayLabel={day.originalName}
            />
          </li>
        ))}
      </ul>

      {routine.warnings.length > 0 ? (
        <ImportWarnings warnings={routine.warnings} />
      ) : null}
    </section>
  );
}
