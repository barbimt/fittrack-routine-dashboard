import { describe, expect, it } from "vitest";
import { getWorkoutSavePanelCopy } from "./workout-save-panel";

describe("getWorkoutSavePanelCopy", () => {
  it("returns first-save copy when session is saved", () => {
    expect(
      getWorkoutSavePanelCopy({
        isSessionSaved: true,
        sessionSavedNotice: "first",
        isDayComplete: false,
        completedSets: 3,
        totalSets: 10,
      })
    ).toMatchObject({
      title: "Workout saved for today",
      variant: "success",
    });
  });

  it("returns updated copy after re-save", () => {
    expect(
      getWorkoutSavePanelCopy({
        isSessionSaved: true,
        sessionSavedNotice: "updated",
        isDayComplete: true,
        completedSets: 10,
        totalSets: 10,
      }).title
    ).toBe("Workout updated");
  });

  it("returns partial progress copy when not saved", () => {
    expect(
      getWorkoutSavePanelCopy({
        isSessionSaved: false,
        sessionSavedNotice: "first",
        isDayComplete: false,
        completedSets: 2,
        totalSets: 8,
      }).description
    ).toBe("You’ve completed 2 of 8 sets. You can save partial progress.");
  });

  it("requires at least one set before save messaging", () => {
    expect(
      getWorkoutSavePanelCopy({
        isSessionSaved: false,
        sessionSavedNotice: "first",
        isDayComplete: false,
        completedSets: 0,
        totalSets: 8,
      }).description
    ).toBe("Complete at least one set to save today’s session.");
  });
});
