import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditExerciseDialog } from "./edit-exercise-dialog";
import type { Exercise } from "@/lib/mock-data";

const baseExercise: Exercise = {
  id: "ex-1",
  name: "Calf raise",
  muscleGroup: "Calves",
  targetSets: 2,
  targetReps: 12,
  prescription: "1x12 40kg-1x12 35kg",
  weight: "—",
  restTime: "60s",
  notes: "pause",
  sets: [
    {
      id: "s1",
      setNumber: 1,
      targetReps: 12,
      targetWeight: "40kg",
      actualReps: null,
      completed: false,
    },
    {
      id: "s2",
      setNumber: 2,
      targetReps: 12,
      targetWeight: "35kg",
      actualReps: null,
      completed: false,
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe("EditExerciseDialog", () => {
  it("hydrates fields from the exercise and submits the draft", async () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditExerciseDialog
        open
        onOpenChange={onOpenChange}
        exercise={baseExercise}
        isSubmitting={false}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText("Exercise")).toHaveValue("Calf raise");
    expect(screen.getByLabelText("Set 1 reps")).toHaveValue("12");
    expect(screen.getByLabelText("Set 1 weight in kg")).toHaveValue("40");
    expect(screen.getByLabelText("Set 2 weight in kg")).toHaveValue("35");
    expect(screen.getByLabelText("Notes")).toHaveValue("pause");

    await userEvent.clear(screen.getByLabelText("Exercise"));
    await userEvent.type(screen.getByLabelText("Exercise"), "Standing calf");
    await userEvent.click(screen.getByRole("button", { name: /^Save$/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: "Standing calf",
      muscleGroup: "Calves",
      notes: "pause",
      prescription: expect.stringContaining("40kg"),
    });
  });

  it("does not submit an empty name", async () => {
    const onSubmit = vi.fn();

    render(
      <EditExerciseDialog
        open
        onOpenChange={vi.fn()}
        exercise={baseExercise}
        isSubmitting={false}
        onSubmit={onSubmit}
      />
    );

    await userEvent.clear(screen.getByLabelText("Exercise"));
    expect(screen.getByRole("button", { name: /^Save$/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
