export const MAX_WEIGHT_KG = 1000;

const LB_TO_KG = 0.45359237;

export type ParsedLoad = {
  kg: number | null;
  /** True when the input was in pounds and has been converted. */
  convertedFromLb: boolean;
  /** Words left after removing the number and unit, e.g. `each` in `8kg each`. */
  rest: string | null;
};

export function roundKg(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Reads a load typed by a person: `60`, `60kg`, `7,5 kg`, `~20kg`, `8kg each`,
 * `45 lb`. Text without a number (`Bodyweight`, `TBD`) returns `kg: null` and
 * keeps the text in `rest`.
 */
export function parseLoad(
  input: string | number | null | undefined
): ParsedLoad {
  if (typeof input === "number") {
    return {
      kg: Number.isFinite(input) && input >= 0 ? roundKg(input) : null,
      convertedFromLb: false,
      rest: null,
    };
  }

  const trimmed = input?.trim() ?? "";
  if (!trimmed || trimmed === "—" || trimmed === "-") {
    return { kg: null, convertedFromLb: false, rest: null };
  }

  const match = trimmed.match(
    /(\d+(?:[.,]\d+)?)\s*(kgs?|kilos?|lbs?|libras?|pounds?)?\b/i
  );
  if (!match || match.index === undefined) {
    return { kg: null, convertedFromLb: false, rest: trimmed };
  }

  const amount = Number(match[1].replace(",", "."));
  const unit = match[2]?.toLowerCase() ?? "";
  const isLb = /^(lb|libra|pound)/.test(unit);
  const kg = Number.isFinite(amount)
    ? roundKg(isLb ? amount * LB_TO_KG : amount)
    : null;

  const before = trimmed
    .slice(0, match.index)
    .replace(/[~≈]|\bapprox\.?|\bup to\b|\bhasta\b/gi, "");
  const after = trimmed.slice(match.index + match[0].length);
  const rest = `${before} ${after}`.replace(/\s+/g, " ").trim();

  return {
    kg: kg !== null && kg <= MAX_WEIGHT_KG ? kg : null,
    convertedFromLb: isLb,
    rest: rest.length > 0 ? rest : null,
  };
}

export function parseKg(
  input: string | number | null | undefined
): number | null {
  return parseLoad(input).kg;
}

/** `7.5` → `7.5 kg`, `60` → `60 kg`, `null` → `null`. */
export function formatKg(kg: number | null | undefined): string | null {
  if (kg === null || kg === undefined || !Number.isFinite(kg)) return null;
  return `${formatKgNumber(kg)} kg`;
}

export function formatKgNumber(kg: number): string {
  return String(roundKg(kg));
}

/** Weight input value for editors: `7.5` → `"7.5"`, `null` → `""`. */
export function kgToInput(kg: number | null | undefined): string {
  if (kg === null || kg === undefined || !Number.isFinite(kg)) return "";
  return formatKgNumber(kg);
}
