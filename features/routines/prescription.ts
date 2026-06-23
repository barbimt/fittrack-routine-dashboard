/**
 * Build the NOT NULL `prescription` string from the editor's separate
 * sets / reps fields, e.g. 4 sets x "8-10" -> "4x8-10".
 */
export function buildPrescription(
  plannedSets: number | null,
  targetReps: string | null
): string {
  const sets = plannedSets && plannedSets > 0 ? String(plannedSets) : "";
  const reps = targetReps?.trim() ?? "";
  if (sets && reps) return `${sets}x${reps}`;
  if (reps) return reps;
  if (sets) return `${sets} sets`;
  return "—";
}
