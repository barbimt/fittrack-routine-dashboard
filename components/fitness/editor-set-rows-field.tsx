"use client";

import { Plus, X } from "lucide-react";
import type { EditorSetRow } from "@/features/routines/editorSetRows";
import { Button } from "./button";
import { Input } from "./input";

interface EditorSetRowsFieldProps {
  idPrefix: string;
  rows: EditorSetRow[];
  onUpdateRow: (index: number, patch: Partial<EditorSetRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}

/** Compact set table for editor + edit modal — readable on narrow screens. */
export function EditorSetRowsField({
  idPrefix,
  rows,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
}: EditorSetRowsFieldProps) {
  return (
    <div className="min-w-0">
      <div className="text-muted-foreground mb-1.5 grid grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
        <span className="sr-only">Set</span>
        <span className="col-start-2 pl-0.5">Reps</span>
        <span className="pl-0.5">Kg</span>
        <span className="sr-only">Remove set</span>
      </div>

      <div className="space-y-1.5">
        {rows.map((row, index) => (
          <div
            key={`${idPrefix}-set-${index}`}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-1.5"
          >
            <span className="text-muted-foreground text-center text-sm tabular-nums">
              {index + 1}
            </span>
            <Input
              id={`${idPrefix}-set-${index}-reps`}
              inputMode="numeric"
              value={row.reps}
              placeholder="12"
              aria-label={`Set ${index + 1} reps`}
              onChange={(e) => onUpdateRow(index, { reps: e.target.value })}
              className="h-10 min-w-0 px-2 text-center text-base tabular-nums md:text-sm"
            />
            <Input
              id={`${idPrefix}-set-${index}-weight`}
              inputMode="decimal"
              value={row.weightKg}
              placeholder="0"
              aria-label={`Set ${index + 1} weight in kg`}
              onChange={(e) => onUpdateRow(index, { weightKg: e.target.value })}
              className="h-10 min-w-0 px-2 text-center text-base tabular-nums md:text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onRemoveRow(index)}
              className="text-muted-foreground hover:text-destructive h-9 w-9"
              aria-label={`Remove set ${index + 1}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        type="button"
        onClick={onAddRow}
        className="text-foreground mt-1.5 h-9 gap-1.5 px-2 text-xs font-semibold tracking-wide uppercase"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add set
      </Button>
    </div>
  );
}
