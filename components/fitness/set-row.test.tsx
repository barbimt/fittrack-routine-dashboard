import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SetRow } from "./set-row";
import type { ExerciseSet } from "@/lib/mock-data";

const baseSet: ExerciseSet = {
  id: "set-1",
  setNumber: 1,
  targetReps: 10,
  actualReps: 8,
  completed: true,
};

afterEach(() => {
  cleanup();
});

describe("SetRow", () => {
  it("syncs actual reps from props when not focused", () => {
    const { rerender } = render(<SetRow set={baseSet} readOnly />);

    expect(screen.getByLabelText(/Actual reps/i)).toHaveValue(8);

    rerender(
      <SetRow
        set={{ ...baseSet, actualReps: null, completed: false }}
        readOnly
      />
    );

    expect(screen.getByLabelText(/Actual reps/i)).toHaveValue(null);
  });

  it("disables editing when readOnly", async () => {
    const onToggle = vi.fn();
    render(<SetRow set={baseSet} onToggle={onToggle} readOnly />);

    const checkbox = screen.getByRole("checkbox", {
      name: /Mark set 1 as incomplete/i,
    });
    expect(checkbox).toBeDisabled();

    await userEvent.click(checkbox);
    expect(onToggle).not.toHaveBeenCalled();

    expect(screen.getByLabelText(/Actual reps/i)).toHaveAttribute("readonly");
  });

  it("calls onToggle when checkbox is clicked in edit mode", async () => {
    const onToggle = vi.fn();
    render(
      <SetRow set={{ ...baseSet, completed: false }} onToggle={onToggle} />
    );

    await userEvent.click(
      screen.getByRole("checkbox", { name: /Mark set 1 as complete/i })
    );
    expect(onToggle).toHaveBeenCalledWith("set-1");
  });

  it("calls onToggle when the row is clicked outside the input", async () => {
    const onToggle = vi.fn();
    render(
      <SetRow set={{ ...baseSet, completed: false }} onToggle={onToggle} />
    );

    await userEvent.click(screen.getByText("Set 1"));
    expect(onToggle).toHaveBeenCalledWith("set-1");

    onToggle.mockClear();
    await userEvent.click(screen.getByText(/Target:/));
    expect(onToggle).toHaveBeenCalledWith("set-1");
  });

  it("does not toggle when clicking the actual reps input", async () => {
    const onToggle = vi.fn();
    render(
      <SetRow
        set={{ ...baseSet, completed: false, actualReps: null }}
        onToggle={onToggle}
      />
    );

    await userEvent.click(screen.getByLabelText(/Actual reps/i));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
