import type { ParsedRoutine } from "../types";
import { ImportDayExercises } from "./ImportDayExercises";
import { ImportWarnings } from "./ImportWarnings";

interface ImportPreviewProps {
  routine: ParsedRoutine;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function ImportPreview({ routine }: ImportPreviewProps) {
  const exercises = routine.days.flatMap((day) => day.exercises);
  const setCount = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const rowWarnings = routine.warnings.filter((w) => w.exerciseName);
  const fileWarnings = routine.warnings.filter((w) => !w.exerciseName);

  return (
    <section className="space-y-4" aria-labelledby="routine-preview-title">
      <div>
        <h2
          id="routine-preview-title"
          className="text-foreground text-lg font-semibold"
        >
          Check your routine
        </h2>
        <p className="text-muted-foreground text-sm">
          {plural(routine.days.length, "day")} ·{" "}
          {plural(exercises.length, "exercise")} · {plural(setCount, "set")}.
          Tap an exercise to see its sets.
        </p>
        {rowWarnings.length > 0 ? (
          <p className="text-foreground mt-1 text-sm">
            {plural(rowWarnings.length, "exercise")} need a quick check. You can
            import now and fix them in the editor.
          </p>
        ) : null}
      </div>

      <ul className="space-y-3" aria-label="Routine days">
        {routine.days.map((day) => (
          <li
            key={`${day.originalName}-${day.sortOrder}`}
            className="border-border bg-card rounded-2xl border p-4 shadow-sm"
          >
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-foreground font-medium">{day.name}</p>
              <p className="text-muted-foreground shrink-0 text-xs">
                {plural(day.exercises.length, "exercise")}
              </p>
            </div>
            {day.focus ? (
              <p className="text-muted-foreground mb-1 text-sm">{day.focus}</p>
            ) : null}
            <ImportDayExercises exercises={day.exercises} />
          </li>
        ))}
      </ul>

      {fileWarnings.length > 0 ? (
        <ImportWarnings warnings={fileWarnings} title="Skipped" />
      ) : null}
    </section>
  );
}
