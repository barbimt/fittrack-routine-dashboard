import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  SelectedTrainingDayProvider,
  useSelectedTrainingDay,
} from "./selected-training-day-context";

function wrapper({ children }: { children: ReactNode }) {
  return <SelectedTrainingDayProvider>{children}</SelectedTrainingDayProvider>;
}

describe("SelectedTrainingDayProvider", () => {
  it("remembers the selected day per routine id", () => {
    const { result } = renderHook(() => useSelectedTrainingDay(), { wrapper });

    expect(result.current.getSelectedDayId("routine-a")).toBeNull();

    act(() => {
      result.current.setSelectedDayId("routine-a", "day-glutes");
    });

    expect(result.current.getSelectedDayId("routine-a")).toBe("day-glutes");
    expect(result.current.getSelectedDayId("routine-b")).toBeNull();
  });
});
