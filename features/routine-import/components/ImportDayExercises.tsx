"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/fitness/badge";
import { muscleGroupLabel } from "@/features/routines/muscleGroups";
import { formatSetsSummary } from "@/features/routines/sets";
import { cn } from "@/lib/utils";
import type { ParsedRoutineExercise } from "../types";
import { PlannedSetsTable } from "./PlannedSetsTable";

function ExerciseRow({ exercise }: { exercise: ParsedRoutineExercise }) {
  const [open, setOpen] = useState(exercise.warnings.length > 0);
  const muscle = muscleGroupLabel(exercise.muscleGroup);
  const contentId = `import-exercise-${exercise.sortOrder}-${exercise.name.replace(/\W+/g, "-")}`;

  return (
    <li className="border-border/60 border-t first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={contentId}
        className="hover:bg-muted/40 -mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-2 rounded-lg px-2 py-2 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-foreground text-sm font-medium">
              {exercise.name}
            </span>
            {muscle ? (
              <Badge variant="muscle" className="text-[11px]">
                {muscle}
              </Badge>
            ) : null}
            {exercise.warnings.length > 0 ? (
              <AlertTriangle
                className="text-warning h-3.5 w-3.5 shrink-0"
                aria-label="Needs a check"
              />
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs tabular-nums">
            {formatSetsSummary(exercise.sets)}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "text-muted-foreground h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div id={contentId} className="space-y-2 pb-3">
          {exercise.warnings.map((warning) => (
            <p
              key={warning}
              className="bg-warning/10 text-foreground rounded-md px-2 py-1.5 text-xs"
            >
              {warning}
            </p>
          ))}
          <PlannedSetsTable
            sets={exercise.sets}
            caption={`Sets for ${exercise.name}`}
          />
          {exercise.notes ? (
            <p className="text-muted-foreground text-xs">
              Notes: {exercise.notes}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

interface ImportDayExercisesProps {
  exercises: ParsedRoutineExercise[];
}

export function ImportDayExercises({ exercises }: ImportDayExercisesProps) {
  return (
    <ul>
      {exercises.map((exercise) => (
        <ExerciseRow
          key={`${exercise.sortOrder}-${exercise.name}`}
          exercise={exercise}
        />
      ))}
    </ul>
  );
}
