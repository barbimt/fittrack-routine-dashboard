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
          { id: "r1", setType: "warmup", reps: "12", weightKg: "40" },
          { id: "r2", setType: "working", reps: "8-10", weightKg: "35" },
        ]}
        onUpdateRow={vi.fn()}
        onAddRow={vi.fn()}
        onRemoveRow={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Set 1 reps")).toHaveValue("12");
    expect(screen.getByLabelText("Set 1 weight in kg")).toHaveValue("40");
    expect(screen.getByLabelText("Set 2 reps")).toHaveValue("8-10");
    expect(screen.getByLabelText("Set 2 weight in kg")).toHaveValue("35");
    expect(
      screen.getByRole("button", { name: /Set 1: Warm-up/i })
    ).toHaveTextContent("W");
    expect(
      screen.getByRole("button", { name: /Set 2: Working/i })
    ).toHaveTextContent("1");
  });

  it("cycles the set type and shows how to fix a bad value", async () => {
    const onUpdateRow = vi.fn();
    render(
      <EditorSetRowsField
        idPrefix="ex-1"
        rows={[{ id: "r1", setType: "working", reps: "12", weightKg: "heavy" }]}
        onUpdateRow={onUpdateRow}
        onAddRow={vi.fn()}
        onRemoveRow={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Set 1: enter kg as a number, like 20 or 7.5"
    );
    expect(screen.getByLabelText("Set 1 weight in kg")).toHaveAttribute(
      "aria-invalid",
      "true"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Change set type/i })
    );
    expect(onUpdateRow).toHaveBeenCalledWith(0, { setType: "warmup" });
  });

  it("notifies when a set field changes, a set is added, or removed", async () => {
    const onUpdateRow = vi.fn();
    const onAddRow = vi.fn();
    const onRemoveRow = vi.fn();

    render(
      <EditorSetRowsField
        idPrefix="ex-1"
        rows={[{ id: "r1", setType: "working", reps: "12", weightKg: "40" }]}
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
