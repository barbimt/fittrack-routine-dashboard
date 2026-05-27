import type { CanonicalColumn } from "../types";

const HEADER_ALIASES: Record<string, CanonicalColumn> = {
  EXERCISE: "EXERCISE",
  EXERCISES: "EXERCISE",
  EJERCICIO: "EXERCISE",
  EJERCICIOS: "EXERCISE",
  "SETS X REPS": "SETS_X_REPS",
  "SETS X REP": "SETS_X_REPS",
  "SETSXREPS": "SETS_X_REPS",
  "SERIES X REPS": "SETS_X_REPS",
  "SERIES X REPETICIONES": "SETS_X_REPS",
  "SERIES X REP": "SETS_X_REPS",
  "SERIESXREPS": "SETS_X_REPS",
  SETS: "SETS_X_REPS",
  SERIES: "SETS_X_REPS",
  REPS: "SETS_X_REPS",
  WEIGHT: "WEIGHT",
  PESO: "WEIGHT",
  NOTES: "NOTES",
  NOTE: "NOTES",
  NOTAS: "NOTES",
  NOTA: "NOTES",
};

export function normaliseHeaderCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function canonicaliseHeader(normalised: string): CanonicalColumn | null {
  if (!normalised) return null;
  const direct = HEADER_ALIASES[normalised];
  if (direct) return direct;

  if (/^(SETS|SERIES)\s*X\s*REPS?$/i.test(normalised.replace(/\s+/g, " "))) {
    return "SETS_X_REPS";
  }

  return null;
}

export type HeaderMap = Partial<Record<CanonicalColumn, number>>;

export function mapHeaderRow(row: unknown[]): { map: HeaderMap; unknownHeaders: string[] } {
  const map: HeaderMap = {};
  const unknownHeaders: string[] = [];

  row.forEach((cell, index) => {
    const normalised = normaliseHeaderCell(cell);
    if (!normalised) return;

    const canonical = canonicaliseHeader(normalised);
    if (canonical) {
      if (map[canonical] === undefined) {
        map[canonical] = index;
      }
      return;
    }

    unknownHeaders.push(normalised);
  });

  return { map, unknownHeaders };
}

export function getCell(row: unknown[], columnIndex: number | undefined): string {
  if (columnIndex === undefined) return "";
  const value = row[columnIndex];
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function isRowEmpty(row: unknown[]): boolean {
  return row.every((cell) => {
    if (cell === null || cell === undefined) return true;
    return String(cell).trim() === "";
  });
}
