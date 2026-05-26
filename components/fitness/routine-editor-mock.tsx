"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TrainingDay } from "@/lib/mock-data";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface RoutineEditorMockProps {
  days: TrainingDay[];
  defaultExpandedDayId?: string;
}

export function RoutineEditorMock({
  days,
  defaultExpandedDayId = "monday",
}: RoutineEditorMockProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(defaultExpandedDayId);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Training days</h2>
          <p className="text-sm text-muted-foreground">
            Visual editor — connect state and persistence in Cursor
          </p>
        </div>
        <Button className="gap-2 shrink-0" type="button">
          <Save className="h-4 w-4" aria-hidden />
          Save routine
        </Button>
      </div>

      {days.map((day) => {
        const isExpanded = expandedDay === day.id;

        return (
          <Card key={day.id} className="overflow-hidden rounded-2xl shadow-sm">
            <CardHeader
              className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedDay(isExpanded ? null : day.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedDay(isExpanded ? null : day.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical
                    className="h-5 w-5 text-muted-foreground cursor-grab"
                    aria-hidden
                  />
                  <div>
                    <CardTitle className="text-base">{day.dayName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{day.focus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="muscle">{day.exercises.length} exercises</Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" aria-hidden />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {day.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted/30 p-3"
                    >
                      <GripVertical
                        className="h-5 w-5 text-muted-foreground cursor-grab mt-2"
                        aria-hidden
                      />

                      <div className="flex-1 grid grid-cols-1 gap-3 md:grid-cols-6">
                        <div className="md:col-span-2">
                          <label
                            htmlFor={`${exercise.id}-name`}
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Exercise
                          </label>
                          <Input
                            id={`${exercise.id}-name`}
                            defaultValue={exercise.name}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`${exercise.id}-muscle`}
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Muscle
                          </label>
                          <Input
                            id={`${exercise.id}-muscle`}
                            defaultValue={exercise.muscleGroup}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`${exercise.id}-sets`}
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Sets
                          </label>
                          <Input
                            id={`${exercise.id}-sets`}
                            type="number"
                            defaultValue={exercise.targetSets}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`${exercise.id}-reps`}
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Reps
                          </label>
                          <Input
                            id={`${exercise.id}-reps`}
                            defaultValue={String(exercise.targetReps)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`${exercise.id}-weight`}
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Weight
                          </label>
                          <Input
                            id={`${exercise.id}-weight`}
                            defaultValue={exercise.weight}
                            className="h-9"
                          />
                        </div>
                        <div className="md:col-span-6 md:max-w-[120px]">
                          <label
                            htmlFor={`${exercise.id}-rest`}
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Rest
                          </label>
                          <Input
                            id={`${exercise.id}-rest`}
                            defaultValue={exercise.restTime}
                            className="h-9"
                          />
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="text-muted-foreground hover:text-destructive mt-5 h-11 w-11"
                        aria-label={`Remove ${exercise.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    "mt-4 w-full gap-2 border-dashed",
                    "hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add exercise
                </Button>
              </CardContent>
            )}
          </Card>
        );
      })}

      <Button
        variant="outline"
        type="button"
        className="w-full gap-2 border-dashed hover:border-primary hover:bg-primary/5"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add training day
      </Button>
    </div>
  );
}
