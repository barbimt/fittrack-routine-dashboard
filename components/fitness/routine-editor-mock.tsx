"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TrainingDay } from "@/lib/mock-data";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [expandedDay, setExpandedDay] = useState<string | null>(
    defaultExpandedDayId
  );

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Training days
          </h2>
          <p className="text-muted-foreground text-sm">
            Visual editor — connect state and persistence in Cursor
          </p>
        </div>
        <Button className="shrink-0 gap-2" type="button">
          <Save className="h-4 w-4" aria-hidden />
          Save routine
        </Button>
      </div>

      {days.map((day) => {
        const isExpanded = expandedDay === day.id;

        return (
          <Card key={day.id} className="overflow-hidden rounded-2xl shadow-sm">
            <CardHeader
              className="hover:bg-muted/30 cursor-pointer transition-colors"
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
                    className="text-muted-foreground h-5 w-5 cursor-grab"
                    aria-hidden
                  />
                  <div>
                    <CardTitle className="text-base">{day.dayName}</CardTitle>
                    <p className="text-muted-foreground text-sm">{day.focus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="muscle">
                    {day.exercises.length} exercises
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp
                      className="text-muted-foreground h-5 w-5"
                      aria-hidden
                    />
                  ) : (
                    <ChevronDown
                      className="text-muted-foreground h-5 w-5"
                      aria-hidden
                    />
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
                      className="border-border bg-surface-muted/30 flex items-start gap-3 rounded-xl border p-3"
                    >
                      <GripVertical
                        className="text-muted-foreground mt-2 h-5 w-5 cursor-grab"
                        aria-hidden
                      />

                      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-6">
                        <div className="md:col-span-2">
                          <label
                            htmlFor={`${exercise.id}-name`}
                            className="text-muted-foreground mb-1 block text-xs"
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
                            className="text-muted-foreground mb-1 block text-xs"
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
                            className="text-muted-foreground mb-1 block text-xs"
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
                            className="text-muted-foreground mb-1 block text-xs"
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
                            className="text-muted-foreground mb-1 block text-xs"
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
                            className="text-muted-foreground mb-1 block text-xs"
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
        className="hover:border-primary hover:bg-primary/5 w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add training day
      </Button>
    </div>
  );
}
