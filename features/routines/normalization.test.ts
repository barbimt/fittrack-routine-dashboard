import { describe, expect, it } from "vitest";
import { legacyExercisePlan, mergeNotes } from "./exercisePlan";
import { parseMuscleList, toMuscleGroup } from "./muscleGroups";
import {
  formatSetsSummary,
  formatWeightRange,
  legacyColumnsFromSets,
  setsToPrescription,
  type PlannedSet,
} from "./sets";
import { sanitizeMuscles, parsePlannedSets } from "./setSchema";
import { formatKg, parseKg, parseLoad } from "./weight";

const set = (
  repsMin: number | null,
  weightKg: number | null,
  setType: PlannedSet["setType"] = "working",
  repsMax = repsMin
): PlannedSet => ({ setType, repsMin, repsMax, weightKg });

describe("weight", () => {
  it.each([
    ["60kg", 60],
    ["7,5 kg", 7.5],
    ["~20kg", 20],
    ["up to 4kg", 4],
    [12, 12],
    ["Bodyweight", null],
    ["TBD", null],
    ["", null],
  ])("parseKg(%s) = %s", (input, kg) => {
    expect(parseKg(input)).toBe(kg);
  });

  it("converts lb and keeps leftover words", () => {
    expect(parseLoad("45 lb")).toMatchObject({ kg: 20.41, convertedFromLb: true });
    expect(parseLoad("8kg each")).toMatchObject({ kg: 8, rest: "each" });
  });

  it("formats kg without trailing zeros", () => {
    expect(formatKg(7.5)).toBe("7.5 kg");
    expect(formatKg(60)).toBe("60 kg");
    expect(formatKg(null)).toBeNull();
  });
});

describe("sets", () => {
  const sets = [set(15, 20, "warmup"), set(8, 60), set(8, 60), set(8, 60)];

  it("builds the display prescription from rows", () => {
    expect(setsToPrescription(sets)).toBe("W1x15 20kg-3x8 60kg");
    expect(setsToPrescription([set(8, null, "working", 10)])).toBe("1x8-10");
  });

  it("summarises sets for headers", () => {
    expect(formatWeightRange(sets)).toBe("20–60 kg");
    expect(formatSetsSummary([set(12, 20), set(12, 20)])).toBe(
      "2 sets · 12 reps · 20 kg"
    );
    expect(formatSetsSummary(sets)).toBe("1 warm-up + 3 sets · 8 reps · 60 kg");
  });

  it("derives legacy columns", () => {
    expect(legacyColumnsFromSets([set(12, 20), set(12, 20)])).toEqual({
      prescription: "2x12 20kg",
      planned_sets: 2,
      target_reps: "12",
      weight: "20kg",
    });
  });

  it("validates planned sets on the server", () => {
    expect(parsePlannedSets([set(12, 20.004)])).toEqual({
      ok: true,
      sets: [set(12, 20)],
    });
    expect(parsePlannedSets([]).ok).toBe(false);
    expect(parsePlannedSets([set(12, -1)]).ok).toBe(false);
    expect(parsePlannedSets([set(10, null, "working", 8)]).ok).toBe(false);
  });
});

describe("muscle groups", () => {
  it.each([
    ["Glúteos", "glutes"],
    ["isquios", "hamstrings"],
    ["Full Body", "full_body"],
    ["quads", "quads"],
    ["unknown", null],
  ])("toMuscleGroup(%s) = %s", (input, slug) => {
    expect(toMuscleGroup(input)).toBe(slug);
  });

  it("splits lists and reports unknown names", () => {
    expect(parseMuscleList("glutes, isquios / nope")).toEqual({
      muscles: ["glutes", "hamstrings"],
      unknown: ["nope"],
    });
  });

  it("drops unknown slugs and the primary from secondary muscles", () => {
    expect(sanitizeMuscles("glutes", ["glutes", "quads", "nope"])).toEqual({
      muscleGroup: "glutes",
      secondaryMuscles: ["quads"],
    });
    expect(sanitizeMuscles("Glutes", [])).toEqual({
      muscleGroup: null,
      secondaryMuscles: [],
    });
  });
});

describe("legacyExercisePlan", () => {
  it("parses legacy text and keeps leftovers for the notes", () => {
    expect(
      legacyExercisePlan({
        prescription: "3x8-10 per leg",
        planned_sets: 3,
        target_reps: "8-10",
        weight: "~12kg",
      })
    ).toEqual({
      sets: Array.from({ length: 3 }, () => set(8, 12, "working", 10)),
      extraNotes: ["per leg"],
    });
  });

  it("falls back to planned_sets and moves unreadable text to notes", () => {
    const plan = legacyExercisePlan({
      prescription: "AMRAP",
      planned_sets: 2,
      target_reps: "12",
      weight: "Bodyweight",
    });
    expect(plan.sets).toEqual([set(12, null), set(12, null)]);
    expect(plan.extraNotes).toEqual(["AMRAP", "Bodyweight"]);
  });

  it("merges notes without duplicates", () => {
    expect(mergeNotes("Superset A", ["per leg", "superset a"])).toBe(
      "Superset A · per leg"
    );
    expect(mergeNotes(null, [])).toBeNull();
  });
});
