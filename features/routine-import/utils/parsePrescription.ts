export type PrescriptionParseResult = {
  plannedSets: number | null;
  targetReps: string | null;
  parsed: boolean;
};

/** Excel/Word often use × (U+00D7) instead of ASCII x — normalize before parsing. */
export function normalizePrescriptionInput(prescription: string): string {
  return prescription
    .replace(/\u00D7/g, "x")
    .replace(/\u2715/g, "x")
    .replace(/\u2716/g, "x")
    .replace(/\u2A09/g, "x");
}

const BLOCK_PATTERN = /^(\d+)\s*x\s*(.+)$/i;

function parseBlock(block: string): { sets: number; reps: string } | null {
  const trimmed = normalizePrescriptionInput(block).trim().replace(/^-/, "");
  if (!trimmed) return null;

  const match = trimmed.match(BLOCK_PATTERN);
  if (!match) return null;

  const sets = Number.parseInt(match[1], 10);
  const reps = match[2].trim();
  if (!Number.isFinite(sets) || sets < 1 || !reps) return null;

  return { sets, reps };
}

function splitPrescriptionBlocks(prescription: string): string[] {
  return prescription
    .split(/\s*-\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function parsePrescription(
  prescription: string
): PrescriptionParseResult {
  const trimmed = normalizePrescriptionInput(prescription).trim();
  if (!trimmed) {
    return { plannedSets: null, targetReps: null, parsed: false };
  }

  const blocks = splitPrescriptionBlocks(trimmed);
  const segments =
    blocks.length > 0
      ? blocks.map((block) => parseBlock(block)).filter(Boolean)
      : [parseBlock(trimmed)];

  const parsedSegments = segments.filter(
    (segment): segment is { sets: number; reps: string } => segment !== null
  );

  if (parsedSegments.length === 0) {
    return { plannedSets: null, targetReps: null, parsed: false };
  }

  const plannedSets = parsedSegments.reduce(
    (sum, segment) => sum + segment.sets,
    0
  );
  const repsValues = parsedSegments.map((segment) => segment.reps);
  const uniqueReps = [...new Set(repsValues)];
  const targetReps =
    uniqueReps.length === 1 ? uniqueReps[0] : repsValues[repsValues.length - 1];

  return {
    plannedSets,
    targetReps,
    parsed: true,
  };
}
