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
