import { cn } from "@/lib/utils";
import {
  formatReps,
  setLabels,
  type PlannedSet,
  type SetType,
} from "@/features/routines/sets";
import { formatKgNumber } from "@/features/routines/weight";

interface PlannedSetsTableProps {
  sets: PlannedSet[];
  caption?: string;
  className?: string;
}

function plannedSetRows(sets: PlannedSet[]) {
  const labels = setLabels(sets);
  const seen: Record<SetType, number> = { warmup: 0, working: 0, drop: 0 };
  return sets.map((set, position) => {
    seen[set.setType] += 1;
    return {
      set,
      label: labels[position],
      key: `${set.setType}-${seen[set.setType]}`,
    };
  });
}

/** Read-only set list styled like the workout screen. */
export function PlannedSetsTable({
  sets,
  caption,
  className,
}: PlannedSetsTableProps) {
  const rows = plannedSetRows(sets);

  return (
    <table className={cn("w-full text-sm", className)}>
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead>
        <tr className="text-muted-foreground text-[11px] tracking-wide uppercase">
          <th scope="col" className="w-12 py-1 text-left font-medium">
            Set
          </th>
          <th scope="col" className="py-1 text-left font-medium">
            Reps
          </th>
          <th scope="col" className="py-1 text-right font-medium">
            Kg
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-border/50 border-t">
            <td className="py-1.5">
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-xs font-semibold tabular-nums",
                  row.set.setType === "warmup" && "bg-warning/20 text-foreground",
                  row.set.setType === "drop" && "bg-primary/10 text-primary",
                  row.set.setType === "working" && "text-muted-foreground"
                )}
              >
                {row.label}
              </span>
            </td>
            <td className="text-foreground py-1.5 tabular-nums">
              {formatReps(row.set.repsMin, row.set.repsMax) ?? "—"}
            </td>
            <td className="text-foreground py-1.5 text-right tabular-nums">
              {row.set.weightKg !== null ? formatKgNumber(row.set.weightKg) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
