"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { EditorRoutine } from "@/features/routines/editorTypes";
import { useRoutineEditor } from "@/hooks/use-routine-editor";
import { Button } from "./button";
import { Input } from "./input";
import { useEditorSensors } from "./sortable-row";
import { EditorField, StatusBanner } from "./routine-editor-fields";
import { RoutineEditorDayCard } from "./routine-editor-day-card";
import { RoutineEditorSaveBar } from "./routine-editor-save-bar";

interface RoutineEditorClientProps {
  routine: EditorRoutine;
  isNew?: boolean;
}

export function RoutineEditorClient({
  routine,
  isNew = false,
}: RoutineEditorClientProps) {
  const editor = useRoutineEditor(routine, { isNew });
  const sensors = useEditorSensors();

  return (
    <div className="space-y-4">
      {isNew ? (
        <EditorField id="routine-name" label="Routine name">
          <Input
            id="routine-name"
            value={editor.name}
            onChange={(event) => editor.updateName(event.target.value)}
            placeholder="My routine"
            autoComplete="off"
          />
        </EditorField>
      ) : null}

      <div className="mb-2">
        <h2 className="text-foreground text-lg font-semibold">Training days</h2>
        <p className="text-muted-foreground text-sm">
          {isNew
            ? "Add days and exercises, then save to create your routine."
            : "Drag to reorder, edit any field, then save your changes."}
        </p>
      </div>

      {editor.dayErrors.length > 0 ? (
        <StatusBanner variant="error">
          <p className="font-medium">Fix these before saving your routine:</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {editor.dayErrors.map((error) => (
              <li key={error.dayId}>
                <span className="font-medium">{error.dayName}</span>:{" "}
                {error.messages.join(", ")}
              </li>
            ))}
          </ul>
        </StatusBanner>
      ) : null}

      <DndContext
        id="routine-days-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={editor.reorderDays}
      >
        <SortableContext
          items={editor.days.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {editor.days.map((day) => (
              <RoutineEditorDayCard
                key={day.id}
                day={day}
                expanded={editor.expandedDayId === day.id}
                errorMessages={editor.dayErrorsById.get(day.id)}
                onToggle={() => editor.toggleDay(day.id)}
                onDayChange={(patch) => editor.updateDay(day.id, patch)}
                onDeleteDay={() => editor.deleteDay(day.id)}
                onExerciseChange={(exerciseId, patch) =>
                  editor.updateExercise(day.id, exerciseId, patch)
                }
                onDeleteExercise={(exerciseId) =>
                  editor.deleteExercise(day.id, exerciseId)
                }
                onAddExercise={() => editor.addExercise(day.id)}
                onReorderExercises={(event) =>
                  editor.reorderExercises(day.id, event)
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        type="button"
        onClick={editor.addDay}
        className="hover:border-primary hover:bg-primary/5 w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add training day
      </Button>

      <RoutineEditorSaveBar
        isNew={isNew}
        isDirty={editor.isDirty}
        saving={editor.saving}
        saveError={editor.saveError}
        saved={editor.saved}
        onSave={() => void editor.save()}
      />
    </div>
  );
}
