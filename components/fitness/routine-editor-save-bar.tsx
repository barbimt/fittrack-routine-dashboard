"use client";

import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface RoutineEditorSaveBarProps {
  isNew: boolean;
  isDirty: boolean;
  saving: boolean;
  saveError: string | null;
  saved: boolean;
  onSave: () => void;
}

export function RoutineEditorSaveBar({
  isNew,
  isDirty,
  saving,
  saveError,
  saved,
  onSave,
}: RoutineEditorSaveBarProps) {
  const hint =
    !isDirty && !saving
      ? isNew
        ? "Add at least one day and exercise to create your routine."
        : "No changes to save yet."
      : null;

  const success =
    saved && !isDirty ? (isNew ? "Routine created." : "Routine saved.") : null;

  return (
    <div
      className={cn(
        "border-border bg-card/95 border-t shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          {saveError ? (
            <p className="text-destructive text-sm" role="alert">
              {saveError}
            </p>
          ) : success ? (
            <p className="text-success text-sm" role="status">
              {success}
            </p>
          ) : hint ? (
            <p className="text-muted-foreground text-xs sm:text-sm">{hint}</p>
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm">
              {isNew
                ? "Ready to create your routine."
                : "You have unsaved changes."}
            </p>
          )}
        </div>

        <Button
          size="lg"
          type="button"
          className="h-11 w-full gap-2 sm:w-auto sm:min-w-40"
          disabled={!isDirty || saving}
          onClick={onSave}
        >
          <Save className="h-4 w-4" aria-hidden />
          {saving ? "Saving…" : isNew ? "Create routine" : "Save routine"}
        </Button>
      </div>
    </div>
  );
}
