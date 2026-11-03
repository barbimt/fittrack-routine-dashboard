import {
  MAX_REPS,
  MAX_SETS_PER_EXERCISE,
  type PlannedSet,
  type SetType,
} from "@/features/routines/sets";
import { parseLoad } from "@/features/routines/weight";

export type PrescriptionParseResult = {
  sets: PlannedSet[];
  /** True when at least one block like `3x12` was read. */
  ok: boolean;
  /** Free text kept for the exercise notes, e.g. `per leg`. */
  notes: string[];
  /** Blocks that looked like sets but could not be read. */
  unreadable: string[];
  convertedFromLb: boolean;
};

/** Excel/Word often use × (U+00D7) instead of ASCII x — normalize before parsing. */
export function normalizePrescriptionInput(prescription: string): string {
  return prescription
    .replace(/[\u00D7\u2715\u2716\u2A09]/g, "x")
    .replace(/[\u2013\u2014]/g, "-");
}

const SEPARATORS = /^[\s\-+,;/|]+|[\s\-+,;/|]+$/g;
const BLOCK_START = /(?<=^|[\s\-+,;/|])(?:w|d)?\s*\d+\s*x\s*\d/gi;
const BLOCK =
  /^(?:(w|d)\s*)?(\d+)\s*x\s*(\d+)(?:\s*(?:-|a|to)\s*(\d+)(?!\s*x))?\s*(.*)$/i;

const TIME_UNIT =
  /^(sec|secs|seconds?|s|min|mins|minutes?|seg|segundos?)\b(.*)$/i;
const SET_COUNT_ONLY = /^(\d{1,2})$/;

function formatRange(min: number, max: number): string {
  return min === max ? String(min) : `${min}-${max}`;
}

function splitBlocks(text: string): { lead: string; blocks: string[] } {
  const starts = [...text.matchAll(BLOCK_START)].map(
    (match) => match.index ?? 0
  );
  if (starts.length === 0) return { lead: text.trim(), blocks: [] };

  const lead = text.slice(0, starts[0]).replace(SEPARATORS, "");
  const blocks = starts.map((start, index) =>
    text.slice(start, starts[index + 1] ?? text.length).replace(SEPARATORS, "")
  );
  return { lead, blocks };
}

type BlockParse =
  | {
      ok: true;
      count: number;
      setType: SetType;
      repsMin: number | null;
      repsMax: number | null;
      weightKg: number | null;
      note: string | null;
      convertedFromLb: boolean;
    }
  | { ok: false };

function parseBlock(block: string): BlockParse {
  const match = block.match(BLOCK);
  if (!match) return { ok: false };

  const count = Number.parseInt(match[2], 10);
  const repsMin = Number.parseInt(match[3], 10);
  const repsMax = match[4] ? Number.parseInt(match[4], 10) : repsMin;
  if (
    count < 1 ||
    count > MAX_SETS_PER_EXERCISE ||
    repsMin < 1 ||
    repsMax < repsMin ||
    repsMax > MAX_REPS
  ) {
    return { ok: false };
  }

  const prefix = match[1]?.toLowerCase();
  const setType: SetType =
    prefix === "w" ? "warmup" : prefix === "d" ? "drop" : "working";

  const rest = match[5].trim();
  let weightKg: number | null = null;
  let note: string | null = null;
  let convertedFromLb = false;

  // `3x30 sec`, `2x20-30 sec per side`: timed sets, not reps.
  const timed = rest.match(TIME_UNIT);
  if (timed) {
    const duration = `${formatRange(repsMin, repsMax)} ${timed[1].toLowerCase()}`;
    const extra = timed[2].trim();
    return {
      ok: true,
      count,
      setType,
      repsMin: null,
      repsMax: null,
      weightKg: null,
      note: extra ? `${duration} ${extra}` : duration,
      convertedFromLb: false,
    };
  }

  const atMatch = rest.match(/^(?:@|con|at|with)\s*(.+)$/i);
  if (atMatch) {
    const load = parseLoad(atMatch[1]);
    weightKg = load.kg;
    note = load.rest;
    convertedFromLb = load.convertedFromLb;
  } else if (/\d/.test(rest) && /kg|kilo|lb|libra|pound/i.test(rest)) {
    const load = parseLoad(rest);
    weightKg = load.kg;
    note = load.rest;
    convertedFromLb = load.convertedFromLb;
  } else if (rest) {
    note = rest;
  }

  return {
    ok: true,
    count,
    setType,
    repsMin,
    repsMax,
    weightKg,
    note,
    convertedFromLb,
  };
}

/**
 * Reads `SETS x REPS` text into one row per set.
 *
 * Accepted: `4x10`, `4x8-10`, `1x12 15kg-3x12 20kg`, `3x12 @ 60`, `3x12 con 60`,
 * `7,5kg`, `W1x15 20kg` (warm-up), `D1x10 30kg` (drop set), `3x10 per leg`,
 * `3` (3 sets, reps not set), `3x30 sec` (timed: no reps, duration in notes).
 * `fallbackWeight` (the WEIGHT column) applies to blocks without their own load.
 */
export function parsePrescriptionToSets(
  prescription: string | null | undefined,
  fallbackWeight?: string | number | null
): PrescriptionParseResult {
  const result: PrescriptionParseResult = {
    sets: [],
    ok: false,
    notes: [],
    unreadable: [],
    convertedFromLb: false,
  };

  const text = normalizePrescriptionInput(prescription ?? "").trim();
  if (!text || text === "—") return result;

  const fallback = parseLoad(fallbackWeight ?? null);

  // Just a number: the set count without reps (`3` → 3 sets).
  const countOnly = text.match(SET_COUNT_ONLY);
  if (countOnly) {
    const count = Number.parseInt(countOnly[1], 10);
    if (count >= 1 && count <= MAX_SETS_PER_EXERCISE) {
      result.sets = Array.from({ length: count }, () => ({
        setType: "working" as const,
        repsMin: null,
        repsMax: null,
        weightKg: fallback.kg,
      }));
      result.ok = true;
      result.convertedFromLb = fallback.convertedFromLb;
      if (fallback.rest) result.notes = [fallback.rest];
      return result;
    }
  }

  const { lead, blocks } = splitBlocks(text);
  if (lead) result.unreadable.push(lead);

  const notes = new Set<string>();
  let usedFallback = false;
  for (const block of blocks) {
    const parsed = parseBlock(block);
    if (!parsed.ok) {
      result.unreadable.push(block);
      continue;
    }

    if (parsed.weightKg === null) usedFallback = true;
    const weightKg = parsed.weightKg ?? fallback.kg;
    if (
      parsed.convertedFromLb ||
      (parsed.weightKg === null && fallback.convertedFromLb)
    ) {
      result.convertedFromLb = true;
    }
    if (parsed.note) notes.add(parsed.note);

    for (let i = 0; i < parsed.count; i += 1) {
      if (result.sets.length >= MAX_SETS_PER_EXERCISE) break;
      result.sets.push({
        setType: parsed.setType,
        repsMin: parsed.repsMin,
        repsMax: parsed.repsMax,
        weightKg,
      });
    }
  }

  if (fallback.rest && usedFallback) notes.add(fallback.rest);

  result.ok = result.sets.length > 0;
  result.notes = [...notes];
  return result;
}
