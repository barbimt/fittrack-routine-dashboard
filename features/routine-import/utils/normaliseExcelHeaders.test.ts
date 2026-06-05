import { describe, expect, it } from "vitest";
import {
  getCell,
  isRowEmpty,
  mapHeaderRow,
  normaliseHeaderCell,
} from "./normaliseExcelHeaders";

describe("normaliseHeaderCell", () => {
  it("trims and uppercases header text", () => {
    expect(normaliseHeaderCell("  ejercicio  ")).toBe("EJERCICIO");
  });

  it("returns empty string for nullish values", () => {
    expect(normaliseHeaderCell(null)).toBe("");
    expect(normaliseHeaderCell(undefined)).toBe("");
  });
});

describe("mapHeaderRow", () => {
  it("maps English and Spanish aliases", () => {
    const { map, unknownHeaders } = mapHeaderRow([
      "Exercise",
      "Sets x Reps",
      "Weight",
      "Notas",
    ]);

    expect(map).toEqual({
      EXERCISE: 0,
      SETS_X_REPS: 1,
      WEIGHT: 2,
      NOTES: 3,
    });
    expect(unknownHeaders).toEqual([]);
  });

  it("collects unknown headers", () => {
    const { unknownHeaders } = mapHeaderRow(["Exercise", "Rest Time"]);
    expect(unknownHeaders).toEqual(["REST TIME"]);
  });

  it("keeps first occurrence when duplicate canonical columns appear", () => {
    const { map } = mapHeaderRow(["Exercise", "Ejercicio"]);
    expect(map.EXERCISE).toBe(0);
  });
});

describe("getCell", () => {
  it("returns trimmed string value", () => {
    expect(getCell(["  Hip Thrust  ", 3], 0)).toBe("Hip Thrust");
  });

  it("returns empty string for missing column or nullish cell", () => {
    expect(getCell(["A"], undefined)).toBe("");
    expect(getCell([null], 0)).toBe("");
  });
});

describe("isRowEmpty", () => {
  it("detects empty rows", () => {
    expect(isRowEmpty([null, "", "  "])).toBe(true);
    expect(isRowEmpty(["Hip Thrust", ""])).toBe(false);
  });
});
