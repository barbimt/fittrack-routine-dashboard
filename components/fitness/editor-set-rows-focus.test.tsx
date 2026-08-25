"use client";

import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EditorExercise } from "@/features/routines/editorTypes";
import { useEditorSetRows } from "@/hooks/use-editor-set-rows";
import { EditorSetRowsField } from "./editor-set-rows-field";

afterEach(() => {
  cleanup();
});

function Harness({ initial }: { initial: EditorExercise }) {
  const [exercise, setExercise] = useState(initial);
  const { setRows, updateSetRow, addSet, removeSet } = useEditorSetRows(
    exercise,
    (patch) => setExercise((prev) => ({ ...prev, ...patch }))
  );

  return (
    <EditorSetRowsField
      idPrefix={exercise.id}
      rows={setRows}
      onUpdateRow={updateSetRow}
      onAddRow={addSet}
      onRemoveRow={removeSet}
    />
  );
}

const baseExercise: EditorExercise = {
  id: "ex-focus",
  name: "Squat",
  muscleGroup: null,
  prescription: "3x12",
  plannedSets: 3,
  targetReps: "12",
  weight: "60kg",
  restTime: null,
  notes: null,
  sortOrder: 0,
};

describe("EditorSetRowsField focus regression", () => {
  it("keeps focus on the kg input while clearing and retyping after re-hydrate", async () => {
    const user = userEvent.setup();
    render(<Harness initial={baseExercise} />);

    const weight = screen.getByLabelText("Set 1 weight in kg");
    await user.click(weight);
    expect(weight).toHaveFocus();

    await user.clear(weight);
    expect(weight).toHaveFocus();
    expect(weight).toHaveValue("");

    await user.type(weight, "45");
    expect(weight).toHaveFocus();
    expect(weight).toHaveValue("45");
  });
});
