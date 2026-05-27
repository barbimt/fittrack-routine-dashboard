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

export function ImportPreview({ fileName, fileSize, routine }: ImportPreviewProps) {
  const totalExercises = routine.days.reduce((sum, day) => sum + day.exercises.length, 0);

  return (
    <section className="space-y-6" aria-labelledby="routine-preview-title">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileSpreadsheet className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="routine-preview-title" className="text-lg font-semibold text-foreground">
              Routine preview
            </h2>
            <p className="text-base font-medium text-foreground">{routine.name}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {fileName} · {formatFileSize(fileSize)}
            </p>
            <p className="mt-3 text-sm text-foreground">
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
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3">
              <p className="font-medium text-foreground">{day.originalName}</p>
              <p className="text-sm text-muted-foreground">
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

      {routine.warnings.length > 0 ? <ImportWarnings warnings={routine.warnings} /> : null}
    </section>
  );
}
