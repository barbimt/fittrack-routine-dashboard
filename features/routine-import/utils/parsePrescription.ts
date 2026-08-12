export type PrescriptionParseResult = {
  plannedSets: number | null;
  targetReps: string | null;
  parsed: boolean;
};

export type PrescriptionBlock = {
  sets: number;
  /** Raw reps token (may include text like "10 per leg"). */
  reps: string;
  repsNumber: number | null;
  weight: string | null;
};

export type ExpandedSetTarget = {
  setNumber: number;
  targetReps: number;
  targetWeight: string | null;
};

export type PrescriptionBlockSummary = {
  sets: number;
  reps: number | string;
  weight: string | null;
};

export function getPrescriptionBlockSummaries(
  prescription: string,
  fallbackWeight?: string | null
): PrescriptionBlockSummary[] {
  return parsePrescriptionBlocks(prescription, fallbackWeight).map((block) => ({
    sets: block.sets,
    reps: block.repsNumber ?? block.reps,
    weight: block.weight,
  }));
}

/** Excel/Word often use × (U+00D7) instead of ASCII x — normalize before parsing. */
export function normalizePrescriptionInput(prescription: string): string {
  return prescription
    .replace(/\u00D7/g, "x")
    .replace(/\u2715/g, "x")
    .replace(/\u2716/g, "x")
    .replace(/\u2A09/g, "x");
}

const BLOCK_PATTERN = /^(\d+)\s*x\s*(.+)$/i;

/** True when the token looks like a load (e.g. `15kg`, `7,5 kg`) — not `c/pierna`. */
function looksLikeWeight(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed || !/\d/.test(trimmed)) return false;
  return /kg/i.test(trimmed);
}

function parseRepsAndWeight(repsPart: string): {
  reps: string;
  repsNumber: number | null;
  weight: string | null;
} {
  const trimmed = repsPart.trim();
  if (!trimmed) {
    return { reps: "", repsNumber: null, weight: null };
  }

  const atMatch = trimmed.match(/^(\d+)\s*(?:@|con)\s*(.+)$/i);
  if (atMatch) {
    const reps = atMatch[1];
    return {
      reps,
      repsNumber: Number.parseInt(reps, 10),
      weight: atMatch[2].trim() || null,
    };
  }

  const spaceMatch = trimmed.match(/^(\d+)\s+(.+)$/);
  if (spaceMatch && looksLikeWeight(spaceMatch[2])) {
    const reps = spaceMatch[1];
    return {
      reps,
      repsNumber: Number.parseInt(reps, 10),
      weight: spaceMatch[2].trim(),
    };
  }

  const leadingNumber = trimmed.match(/^(\d+)/);
  if (leadingNumber) {
    return {
      reps: leadingNumber[1],
      repsNumber: Number.parseInt(leadingNumber[1], 10),
      weight: null,
    };
  }

  return { reps: trimmed, repsNumber: null, weight: null };
}

function parseBlock(block: string): PrescriptionBlock | null {
  const trimmed = normalizePrescriptionInput(block).trim().replace(/^-/, "");
  if (!trimmed) return null;

  const match = trimmed.match(BLOCK_PATTERN);
  if (!match) return null;

  const sets = Number.parseInt(match[1], 10);
  const { reps, repsNumber, weight } = parseRepsAndWeight(match[2].trim());
  if (!Number.isFinite(sets) || sets < 1 || !reps) return null;

  return { sets, reps, repsNumber, weight };
}

/** True when kg appears in the prescription text (not from the Weight column). */
export function hasWeightInPrescriptionText(prescription: string): boolean {
  const trimmed = normalizePrescriptionInput(prescription).trim();
  if (!trimmed) return false;

  const blockStrings = splitPrescriptionBlocks(trimmed);
  const segments =
    blockStrings.length > 0
      ? blockStrings.map((block) => parseBlock(block))
      : [parseBlock(trimmed)];

  return segments.some((block) => block !== null && block.weight !== null);
}

/** True when the prescription has multiple blocks (e.g. `1x12-3x10`). */
export function isVariablePrescriptionStructure(prescription: string): boolean {
  const trimmed = normalizePrescriptionInput(prescription).trim();
  if (!trimmed) return false;
  return splitPrescriptionBlocks(trimmed).length > 1;
}

export function splitPrescriptionBlocks(prescription: string): string[] {
  const trimmed = normalizePrescriptionInput(prescription).trim();
  if (!trimmed) return [];

  return trimmed.split(/\s*-\s*|\s+(?=\d+\s*x\s*\d+)/i).flatMap((part) => {
    const trimmedPart = part.trim();
    return trimmedPart.length > 0 ? [trimmedPart] : [];
  });
}

export function parsePrescriptionBlocks(
  prescription: string,
  fallbackWeight?: string | null
): PrescriptionBlock[] {
  const trimmed = normalizePrescriptionInput(prescription).trim();
  if (!trimmed) return [];

  const blockStrings = splitPrescriptionBlocks(trimmed);
  const segments =
    blockStrings.length > 0
      ? blockStrings.flatMap((block) => {
          const parsed = parseBlock(block);
          return parsed ? [parsed] : [];
        })
      : [parseBlock(trimmed)];

  const normalizedFallback =
    fallbackWeight && fallbackWeight.trim() !== "" && fallbackWeight !== "—"
      ? fallbackWeight.trim()
      : null;

  return segments.flatMap((segment) =>
    segment
      ? [{ ...segment, weight: segment.weight ?? normalizedFallback }]
      : []
  );
}

export function expandPrescriptionToSets(
  prescription: string,
  fallbackWeight?: string | null
): ExpandedSetTarget[] {
  const blocks = parsePrescriptionBlocks(prescription, fallbackWeight);
  if (blocks.length === 0) return [];

  const sets: ExpandedSetTarget[] = [];
  let setNumber = 1;

  for (const block of blocks) {
    const reps = block.repsNumber ?? 0;
    for (let i = 0; i < block.sets; i += 1) {
      sets.push({
        setNumber,
        targetReps: reps,
        targetWeight: block.weight,
      });
      setNumber += 1;
    }
  }

  return sets;
}

/** Human-readable block lines for exercise headers, e.g. `1 × 12 · 15kg`. */
export function formatPrescriptionBlockLines(
  prescription: string,
  fallbackWeight?: string | null
): string[] {
  return getPrescriptionBlockSummaries(prescription, fallbackWeight).map(
    (block) => {
      if (block.weight) {
        return `${block.sets} × ${block.reps} · ${block.weight}`;
      }
      return `${block.sets} × ${block.reps}`;
    }
  );
}

export function parsePrescription(
  prescription: string,
  fallbackWeight?: string | null
): PrescriptionParseResult {
  const blocks = parsePrescriptionBlocks(prescription, fallbackWeight);

  if (blocks.length === 0) {
    return { plannedSets: null, targetReps: null, parsed: false };
  }

  const plannedSets = blocks.reduce((sum, block) => sum + block.sets, 0);
  const repsValues = blocks.map((block) => block.reps);
  const uniqueReps = [...new Set(repsValues)];
  const targetReps =
    uniqueReps.length === 1 ? uniqueReps[0] : repsValues[repsValues.length - 1];

  return {
    plannedSets,
    targetReps,
    parsed: true,
  };
}
