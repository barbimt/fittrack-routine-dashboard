import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorSetRowsField } from "./editor-set-rows-field";

afterEach(() => {
  cleanup();
});

describe("EditorSetRowsField", () => {
  it("renders reps and weight inputs for each set", () => {
    render(
      <EditorSetRowsField
        idPrefix="ex-1"
        rows={[
          { id: "r1", reps: "12", weightKg: "40" },
          { id: "r2", reps: "10", weightKg: "35" },
        ]}
        onUpdateRow={vi.fn()}
        onAddRow={vi.fn()}
        onRemoveRow={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Set 1 reps")).toHaveValue("12");
    expect(screen.getByLabelText("Set 1 weight in kg")).toHaveValue("40");
    expect(screen.getByLabelText("Set 2 reps")).toHaveValue("10");
    expect(screen.getByLabelText("Set 2 weight in kg")).toHaveValue("35");
  });

  it("notifies when a set field changes, a set is added, or removed", async () => {
    const onUpdateRow = vi.fn();
    const onAddRow = vi.fn();
    const onRemoveRow = vi.fn();

    render(
      <EditorSetRowsField
        idPrefix="ex-1"
        rows={[{ id: "r1", reps: "12", weightKg: "40" }]}
        onUpdateRow={onUpdateRow}
        onAddRow={onAddRow}
        onRemoveRow={onRemoveRow}
      />
    );

    await userEvent.clear(screen.getByLabelText("Set 1 weight in kg"));
    await userEvent.type(screen.getByLabelText("Set 1 weight in kg"), "45");
    expect(onUpdateRow).toHaveBeenCalled();
    expect(onUpdateRow.mock.calls.at(-1)?.[0]).toBe(0);
    expect(onUpdateRow.mock.calls.at(-1)?.[1]).toEqual(
      expect.objectContaining({ weightKg: expect.any(String) })
    );

    await userEvent.click(screen.getByRole("button", { name: /Add set/i }));
    expect(onAddRow).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole("button", { name: /Remove set 1/i })
    );
    expect(onRemoveRow).toHaveBeenCalledWith(0);
  });
});
