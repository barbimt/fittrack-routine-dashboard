import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExerciseCard } from "./exercise-card";
import type { Exercise } from "@/lib/mock-data";

const exercise: Exercise = {
  id: "ex-1",
  name: "Calf raise",
  muscleGroup: "Calves",
  targetSets: 1,
  targetReps: 12,
  prescription: "1x12 40kg",
  weight: "40kg",
  restTime: "60s",
  sets: [
    {
      id: "s1",
      setNumber: 1,
      targetReps: 12,
      targetWeight: "40kg",
      actualReps: null,
      completed: false,
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe("ExerciseCard", () => {
  it("opens the edit dialog from the pencil and does not show prescription summary text", async () => {
    render(
      <ExerciseCard
        exercise={exercise}
        onEditExercise={vi.fn()}
        onSetToggle={vi.fn()}
      />
    );

    expect(screen.queryByText(/1 × 12/)).not.toBeInTheDocument();
    expect(screen.getByText("60s rest")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Edit Calf raise/i })
    );

    expect(
      screen.getByRole("heading", { name: /Edit exercise/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Exercise")).toHaveValue("Calf raise");
  });

  it("hides the pencil when readOnly", () => {
    render(<ExerciseCard exercise={exercise} readOnly />);
    expect(
      screen.queryByRole("button", { name: /Edit Calf raise/i })
    ).not.toBeInTheDocument();
  });
});
