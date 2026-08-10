import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

import { toast } from "@/hooks/use-toast";
import { notify } from "./notify";

describe("notify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows info / success / error variants", () => {
    notify.info({ title: "Hello", description: "World" });
    notify.success({ title: "Saved" });
    notify.error({ title: "Failed", description: "Try again" });

    expect(toast).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        variant: "default",
        title: "Hello",
        description: "World",
        duration: 4000,
      })
    );
    expect(toast).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variant: "success",
        title: "Saved",
      })
    );
    expect(toast).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        variant: "destructive",
        title: "Failed",
        description: "Try again",
      })
    );
  });

  it("shows a rest-complete notification with optional exercise name", () => {
    notify.restComplete("Calf raise");

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
        title: "Rest done",
        description: "Time for the next set of Calf raise.",
        duration: 5000,
      })
    );
  });

  it("exposes workout session feedback under notify.workout", () => {
    notify.workout.workoutSaved(false, "demo");
    notify.workout.exerciseAdded("Squat");
    notify.workout.setUpdateFailed("Network error");

    expect(toast).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: "Workout saved (demo)",
      })
    );
    expect(toast).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        title: "Exercise added",
        description: "Squat is ready in today’s session.",
      })
    );
    expect(toast).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        variant: "destructive",
        title: "Could not update set",
        description: "Network error",
      })
    );
  });
});
