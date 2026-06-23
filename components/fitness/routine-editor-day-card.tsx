"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EditorDay,
  EditorExercise,
} from "@/features/routines/editorTypes";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DragHandle, useEditorSensors, useSortableRow } from "./sortable-row";
import { EditorPlainTextField, EditorTextField } from "./routine-editor-fields";
import { RoutineEditorExerciseRow } from "./routine-editor-exercise-row";

interface RoutineEditorDayCardProps {
  day: EditorDay;
  expanded: boolean;
  errorMessages?: string[];
  onToggle: () => void;
  onDayChange: (patch: Partial<EditorDay>) => void;
  onDeleteDay: () => void;
  onExerciseChange: (
    exerciseId: string,
    patch: Partial<EditorExercise>
  ) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onAddExercise: () => void;
  onReorderExercises: (event: DragEndEvent) => void;
}

export function RoutineEditorDayCard({
  day,
  expanded,
  errorMessages,
  onToggle,
  onDayChange,
  onDeleteDay,
  onExerciseChange,
  onDeleteExercise,
  onAddExercise,
  onReorderExercises,
}: RoutineEditorDayCardProps) {
  const sensors = useEditorSensors();
  const { setNodeRef, setActivatorNodeRef, style, isDragging, handleProps } =
    useSortableRow(day.id, 20);
  const hasError = (errorMessages?.length ?? 0) > 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "overflow-hidden rounded-2xl shadow-sm",
        isDragging && "shadow-lg",
        hasError && "border-destructive/60 ring-destructive/20 ring-1"
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex items-center gap-3">
          <DragHandle
            ref={setActivatorNodeRef}
            label={`Reorder ${day.name}`}
            className="-ml-1"
            {...handleProps}
          />

          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <EditorPlainTextField
              id={`${day.id}-name`}
              label="Day"
              value={day.name}
              onValueChange={(name) => onDayChange({ name })}
            />
            <EditorTextField
              id={`${day.id}-focus`}
              label="Focus"
              value={day.focus}
              onValueChange={(focus) => onDayChange({ focus })}
            />
          </div>

          <div className="flex items-center gap-1">
            <Badge variant="muscle" className="hidden sm:inline-flex">
              {day.exercises.length}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={onDeleteDay}
              className="text-muted-foreground hover:text-destructive h-9 w-9"
              aria-label={`Delete ${day.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={onToggle}
              className="text-muted-foreground h-9 w-9"
              aria-label={expanded ? "Collapse day" : "Expand day"}
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {hasError ? (
          <p className="text-destructive text-xs" role="alert">
            {errorMessages?.join(" · ")}
          </p>
        ) : null}
      </CardHeader>

      {expanded ? (
        <CardContent className="pt-0">
          <DndContext
            id={`exercises-dnd-${day.id}`}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onReorderExercises}
          >
            <SortableContext
              items={day.exercises.map((ex) => ex.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {day.exercises.map((exercise) => (
                  <RoutineEditorExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onChange={(patch) => onExerciseChange(exercise.id, patch)}
                    onDelete={() => onDeleteExercise(exercise.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {day.exercises.length === 0 ? (
            <p className="text-muted-foreground py-2 text-sm">
              No exercises yet.
            </p>
          ) : null}

          <Button
            variant="outline"
            type="button"
            onClick={onAddExercise}
            className="hover:border-primary hover:bg-primary/5 mt-4 w-full gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add exercise
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
