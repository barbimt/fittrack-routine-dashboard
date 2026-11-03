import { describe, expect, it } from "vitest";
import type { EditorExercise, EditorSetInput } from "./editorTypes";
import {
  addEditorSetRow,
  editorSetsToPlanned,
  exerciseToSetRows,
  plannedToEditorSets,
  removeEditorSetRow,
  setRowsToExercisePatch,
  updateEditorSetRow,
  validateEditorSets,
  type EditorSetRow,
} from "./editorSetRows";

const input = (
  reps: string,
  weightKg: string,
  setType: EditorSetInput["setType"] = "working"
): EditorSetInput => ({ setType, reps, weightKg });

function exercise(sets: EditorSetInput[]): Pick<EditorExercise, "id" | "sets"> {
  return { id: "ex-1", sets };
}

function row(reps: string, weightKg: string, id: string): EditorSetRow {
  return { id, ...input(reps, weightKg) };
}

describe("plannedToEditorSets / editorSetsToPlanned", () => {
  it("round-trips ranges, decimals and set types", () => {
    const planned = [
      { setType: "warmup" as const, repsMin: 15, repsMax: 15, weightKg: 20 },
      { setType: "working" as const, repsMin: 8, repsMax: 10, weightKg: 7.5 },
      {
        setType: "working" as const,
        repsMin: null,
        repsMax: null,
        weightKg: null,
      },
    ];
    const editor = plannedToEditorSets(planned);
    expect(editor).toEqual([
      input("15", "20", "warmup"),
      input("8-10", "7.5"),
      input("", ""),
    ]);
    expect(editorSetsToPlanned(editor)).toEqual(planned);
  });

  it("accepts a comma as decimal separator", () => {
    expect(editorSetsToPlanned([input("12", "7,5")])[0].weightKg).toBe(7.5);
  });
});

describe("validateEditorSets", () => {
  it("returns no issues for valid rows", () => {
    expect(
      validateEditorSets([input("12", "20"), input("8-10", ""), input("", "")])
    ).toEqual([]);
  });

  it("explains how to fix reps and kg", () => {
    const issues = validateEditorSets([
      input("twelve", "20"),
      input("12", "20kg heavy"),
    ]);
    expect(issues).toEqual([
      { index: 0, field: "reps", message: expect.stringContaining("Set 1") },
      {
        index: 1,
        field: "weightKg",
        message: expect.stringContaining("kg as a number"),
      },
    ]);
  });

  it("rejects an inverted rep range", () => {
    expect(validateEditorSets([input("10-8", "")])[0]?.field).toBe("reps");
  });
});

describe("exerciseToSetRows", () => {
  it("keeps stable row ids across re-hydrates so weight inputs keep focus", () => {
    const first = exerciseToSetRows(
      exercise([input("12", "60"), input("12", "60")])
    );
    const second = exerciseToSetRows(
      exercise([input("12", "55"), input("12", "60")])
    );
    expect(first.map((item) => item.id)).toEqual(["ex-1-set-0", "ex-1-set-1"]);
    expect(second.map((item) => item.id)).toEqual(first.map((item) => item.id));
  });

  it("drops row ids when writing back to the exercise", () => {
    expect(setRowsToExercisePatch([row("10", "40", "a")])).toEqual({
      sets: [input("10", "40")],
    });
  });
});

describe("update / add / remove editor set rows", () => {
  it("updates a single row", () => {
    expect(
      updateEditorSetRow([row("12", "40", "a"), row("12", "40", "b")], 1, {
        weightKg: "45",
      })
    ).toEqual([row("12", "40", "a"), row("12", "45", "b")]);
  });

  it("appends a copy of the last row as a working set", () => {
    const result = addEditorSetRow([
      { id: "a", ...input("15", "20", "warmup") },
    ]);
    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({
      setType: "working",
      reps: "15",
      weightKg: "20",
    });
  });

  it("keeps one empty row when removing the last set", () => {
    const result = removeEditorSetRow([row("12", "40", "a")], 0);
    expect(result).toEqual([{ id: expect.any(String), ...input("", "") }]);
  });
});
