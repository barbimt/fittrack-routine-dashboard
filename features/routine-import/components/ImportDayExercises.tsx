"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ParsedRoutineExercise } from "../types";

const INITIAL_VISIBLE = 3;

function ExerciseRow({ exercise }: { exercise: ParsedRoutineExercise }) {
  return (
    <li className="text-sm">
      <span className="font-medium text-foreground">{exercise.name}</span>
      <span className="text-muted-foreground"> · {exercise.prescription}</span>
      {exercise.weight ? (
        <span className="text-muted-foreground"> · {exercise.weight}</span>
      ) : null}
    </li>
  );
}

interface ImportDayExercisesProps {
  exercises: ParsedRoutineExercise[];
  dayLabel: string;
}

export function ImportDayExercises({ exercises, dayLabel }: ImportDayExercisesProps) {
  const [open, setOpen] = useState(false);
  const visible = exercises.slice(0, INITIAL_VISIBLE);
  const hidden = exercises.slice(INITIAL_VISIBLE);
  const hiddenCount = hidden.length;

  return (
    <div>
      <ul className="space-y-2 border-t border-border/60 pt-3">
        {visible.map((exercise) => (
          <ExerciseRow
            key={`${exercise.sortOrder}-${exercise.name}`}
            exercise={exercise}
          />
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
          <CollapsibleTrigger
            className={cn(
              "flex w-full min-h-11 items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-primary",
              "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label={
              open
                ? `Hide ${hiddenCount} more exercises for ${dayLabel}`
                : `Show ${hiddenCount} more exercises for ${dayLabel}`
            }
          >
            <span>
              {open
                ? `Hide ${hiddenCount} more ${hiddenCount === 1 ? "exercise" : "exercises"}`
                : `Show ${hiddenCount} more ${hiddenCount === 1 ? "exercise" : "exercises"}`}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 space-y-2 border-t border-border/40 pt-3">
              {hidden.map((exercise) => (
                <ExerciseRow
                  key={`${exercise.sortOrder}-${exercise.name}`}
                  exercise={exercise}
                />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
}
