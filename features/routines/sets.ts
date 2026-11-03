import { formatKg, formatKgNumber } from "./weight";

export const SET_TYPES = ["warmup", "working", "drop"] as const;
export type SetType = (typeof SET_TYPES)[number];

export const SET_TYPE_LABELS: Record<SetType, string> = {
  warmup: "Warm-up",
  working: "Working",
  drop: "Drop set",
};

export const SET_TYPE_SHORT: Record<SetType, string> = {
  warmup: "W",
  working: "",
  drop: "D",
};

export const MAX_REPS = 100;
export const MAX_SETS_PER_EXERCISE = 30;

/** One planned set. `repsMin === repsMax` for a fixed target; both null when unknown. */
export type PlannedSet = {
  setType: SetType;
  repsMin: number | null;
  repsMax: number | null;
  weightKg: number | null;
};

export function isSetType(value: unknown): value is SetType {
  return typeof value === "string" && (SET_TYPES as readonly string[]).includes(value);
}

export function formatReps(
  repsMin: number | null,
  repsMax: number | null
): string | null {
  if (repsMin === null && repsMax === null) return null;
  const min = repsMin ?? repsMax;
  const max = repsMax ?? repsMin;
  if (min === max) return String(min);
  return `${min}-${max}`;
}

/** Parses `12` or `8-10` (also `8–10`, `8 a 10`). Returns null when not readable. */
export function parseRepsInput(
  raw: string
): { repsMin: number; repsMax: number } | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d{1,3})(?:\s*(?:-|–|a|to)\s*(\d{1,3}))?$/i);
  if (!match) return null;
  const min = Number.parseInt(match[1], 10);
  const max = match[2] ? Number.parseInt(match[2], 10) : min;
  if (min < 1 || max < min || max > MAX_REPS) return null;
  return { repsMin: min, repsMax: max };
}

function sameSet(a: PlannedSet, b: PlannedSet): boolean {
  return (
    a.setType === b.setType &&
    a.repsMin === b.repsMin &&
    a.repsMax === b.repsMax &&
    a.weightKg === b.weightKg
  );
}

/** Display labels: warm-ups are "W", working sets count 1, 2, 3 and drops add "D" (e.g. "3D"). */
export function setLabels(sets: readonly Pick<PlannedSet, "setType">[]): string[] {
  let working = 0;
  return sets.map((set) => {
    if (set.setType === "warmup") return "W";
    working += 1;
    return set.setType === "drop" ? `${working}D` : String(working);
  });
}

export type SetBlock = PlannedSet & { count: number };

/** Groups consecutive identical sets: 3 × (12 @ 20) → one block with count 3. */
export function groupSets(sets: PlannedSet[]): SetBlock[] {
  const blocks: SetBlock[] = [];
  for (const set of sets) {
    const last = blocks[blocks.length - 1];
    if (last && sameSet(last, set)) {
      last.count += 1;
    } else {
      blocks.push({ ...set, count: 1 });
    }
  }
  return blocks;
}

/**
 * Canonical text form, also accepted by the importer:
 * `W1x15 20kg-3x8-10 40kg`. Stored in `routine_exercises.prescription`.
 */
export function setsToPrescription(sets: PlannedSet[]): string {
  if (sets.length === 0) return "—";
  return groupSets(sets)
    .map((block) => {
      const prefix = SET_TYPE_SHORT[block.setType];
      const reps = formatReps(block.repsMin, block.repsMax) ?? "?";
      const weight =
        block.weightKg !== null ? ` ${formatKgNumber(block.weightKg)}kg` : "";
      return `${prefix}${block.count}x${reps}${weight}`;
    })
    .join("-");
}

/** Human summary for cards: `3 × 12 · 60 kg`, one line per block. */
export function formatSetBlockLines(sets: PlannedSet[]): string[] {
  return groupSets(sets).map((block) => {
    const reps = formatReps(block.repsMin, block.repsMax) ?? "?";
    const weight = formatKg(block.weightKg);
    const type = block.setType === "working" ? "" : ` (${SET_TYPE_LABELS[block.setType]})`;
    return `${block.count} × ${reps}${weight ? ` · ${weight}` : ""}${type}`;
  });
}

/** Weight range across sets, e.g. `15–20 kg` or `60 kg`; null when no set has a load. */
export function formatWeightRange(sets: PlannedSet[]): string | null {
  const weights = sets
    .map((set) => set.weightKg)
    .filter((kg): kg is number => kg !== null);
  if (weights.length === 0) return null;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  if (min === max) return formatKg(min);
  return `${formatKgNumber(min)}–${formatKgNumber(max)} kg`;
}

/** Short summary: `4 sets · 12 reps · 15–20 kg`, or `1 warm-up + 3 sets · 8 reps · 60 kg`. */
export function formatSetsSummary(allSets: PlannedSet[]): string {
  if (allSets.length === 0) return "No sets";
  const warmups = allSets.filter((set) => set.setType === "warmup").length;
  const working = allSets.filter((set) => set.setType !== "warmup");
  const sets = working.length > 0 ? working : allSets;
  const count = `${sets.length} ${sets.length === 1 ? "set" : "sets"}`;
  const parts = [
    warmups > 0 && working.length > 0
      ? `${warmups} warm-up${warmups === 1 ? "" : "s"} + ${count}`
      : count,
  ];

  const repsValues = [...new Set(sets.map((set) => formatReps(set.repsMin, set.repsMax)))];
  if (repsValues.length === 1 && repsValues[0]) {
    parts.push(`${repsValues[0]} reps`);
  } else if (repsValues.length > 1) {
    const mins = sets.flatMap((set) => (set.repsMin !== null ? [set.repsMin] : []));
    const maxs = sets.flatMap((set) => (set.repsMax !== null ? [set.repsMax] : []));
    if (mins.length > 0 && maxs.length > 0) {
      parts.push(`${Math.min(...mins)}–${Math.max(...maxs)} reps`);
    }
  }

  const weight = formatWeightRange(sets);
  if (weight) parts.push(weight);
  return parts.join(" · ");
}

/**
 * Legacy columns still written for one release so older readers keep working.
 * `weight` is only set when every set shares the same load.
 */
export function legacyColumnsFromSets(sets: PlannedSet[]): {
  prescription: string;
  planned_sets: number | null;
  target_reps: string | null;
  weight: string | null;
} {
  const repsValues = sets.map((set) => formatReps(set.repsMin, set.repsMax));
  const uniqueReps = [...new Set(repsValues)];
  const weights = [...new Set(sets.map((set) => set.weightKg))];

  return {
    prescription: setsToPrescription(sets),
    planned_sets: sets.length > 0 ? sets.length : null,
    target_reps:
      uniqueReps.length === 1
        ? (uniqueReps[0] ?? null)
        : (repsValues[repsValues.length - 1] ?? null),
    weight:
      weights.length === 1 && weights[0] !== null && weights[0] !== undefined
        ? `${formatKgNumber(weights[0])}kg`
        : null,
  };
}

export function defaultPlannedSets(count = 3, reps = 12): PlannedSet[] {
  return Array.from({ length: count }, () => ({
    setType: "working" as const,
    repsMin: reps,
    repsMax: reps,
    weightKg: null,
  }));
}
