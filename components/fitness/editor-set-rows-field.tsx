"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateEditorSets,
  type EditorSetRow,
} from "@/features/routines/editorSetRows";
import type { EditorSetInput } from "@/features/routines/editorTypes";
import { SET_TYPE_LABELS, setLabels, type SetType } from "@/features/routines/sets";
import { Button } from "./button";
import { Input } from "./input";

interface EditorSetRowsFieldProps {
  idPrefix: string;
  rows: EditorSetRow[];
  onUpdateRow: (index: number, patch: Partial<EditorSetInput>) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}

const NEXT_SET_TYPE: Record<SetType, SetType> = {
  working: "warmup",
  warmup: "drop",
  drop: "working",
};

const GRID =
  "grid grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-1.5";

export function EditorSetRowsField({
  idPrefix,
  rows,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
}: EditorSetRowsFieldProps) {
  const issues = validateEditorSets(rows);
  const invalid = new Set(issues.map((issue) => `${issue.index}-${issue.field}`));
  const labels = setLabels(rows);

  return (
    <div className="min-w-0">
      <div
        className={cn(
          GRID,
          "text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wide uppercase"
        )}
      >
        <span className="text-center">Set</span>
        <span className="pl-0.5">
          Reps <span className="normal-case">(12 or 8-10)</span>
        </span>
        <span className="pl-0.5">Kg</span>
        <span className="sr-only">Remove set</span>
      </div>

      <div className="space-y-1.5">
        {rows.map((row, index) => {
          const label = labels[index];
          const repsInvalid = invalid.has(`${index}-reps`);
          const weightInvalid = invalid.has(`${index}-weightKg`);

          return (
            <div key={row.id} className={GRID}>
              <button
                type="button"
                onClick={() =>
                  onUpdateRow(index, { setType: NEXT_SET_TYPE[row.setType] })
                }
                aria-label={`Set ${index + 1}: ${SET_TYPE_LABELS[row.setType]}. Change set type`}
                title="Tap to switch: working, warm-up, drop set"
                className={cn(
                  "flex h-10 items-center justify-center rounded-md text-sm font-semibold tabular-nums transition-colors",
                  row.setType === "working" &&
                    "text-muted-foreground hover:bg-muted",
                  row.setType === "warmup" &&
                    "bg-warning/20 text-foreground",
                  row.setType === "drop" && "bg-primary/10 text-primary"
                )}
              >
                {label}
              </button>
              <Input
                id={`${idPrefix}-set-${index}-reps`}
                value={row.reps}
                placeholder="12"
                autoComplete="off"
                aria-label={`Set ${index + 1} reps`}
                aria-invalid={repsInvalid || undefined}
                onChange={(e) => onUpdateRow(index, { reps: e.target.value })}
                className={cn(
                  "h-10 min-w-0 px-2 text-center text-base tabular-nums md:text-sm",
                  repsInvalid && "border-destructive"
                )}
              />
              <Input
                id={`${idPrefix}-set-${index}-weight`}
                inputMode="decimal"
                value={row.weightKg}
                placeholder="—"
                autoComplete="off"
                aria-label={`Set ${index + 1} weight in kg`}
                aria-invalid={weightInvalid || undefined}
                onChange={(e) =>
                  onUpdateRow(index, { weightKg: e.target.value })
                }
                className={cn(
                  "h-10 min-w-0 px-2 text-center text-base tabular-nums md:text-sm",
                  weightInvalid && "border-destructive"
                )}
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
          );
        })}
      </div>

      {issues.length > 0 ? (
        <p className="text-destructive mt-1.5 text-xs" role="alert">
          {issues[0].message}
        </p>
      ) : null}

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          type="button"
          onClick={onAddRow}
          className="text-foreground h-9 gap-1.5 px-2 text-xs font-semibold tracking-wide uppercase"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add set
        </Button>
        <p className="text-muted-foreground text-[11px]">
          Tap the set number for warm-up (W) or drop set (D).
        </p>
      </div>
    </div>
  );
}
