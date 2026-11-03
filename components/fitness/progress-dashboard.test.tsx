import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressDashboardView } from "./progress-dashboard";
import { progressFixture } from "@/features/progress/fixture";
import { buildProgressBrief } from "@/features/progress/brief";

afterEach(() => {
  cleanup();
});

describe("ProgressDashboardView", () => {
  it("shows the logged totals, exercise names, and export actions", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <ProgressDashboardView result={{ ok: true, data: progressFixture }} />
    );

    expect(
      screen.getByRole("heading", { name: "Progress" })
    ).toBeInTheDocument();
    expect(screen.getByText("52")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "12 weeks" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "4 weeks" })).toHaveAttribute(
      "href",
      "/progress?range=4w"
    );
    expect(
      screen.getByRole("heading", { name: "One exercise" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Work by exercise" })
    ).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByText(/Best gain:/)).toBeInTheDocument();
    expect(screen.getAllByText("Hip Thrust").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Copy report" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download JSON" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Copy report" }));

    expect(writeText).toHaveBeenCalledWith(buildProgressBrief(progressFixture));
    expect(
      await screen.findByRole("button", { name: "Copied" })
    ).toBeInTheDocument();
  });

  it("points an empty history back to today", () => {
    render(
      <ProgressDashboardView
        result={{
          ok: true,
          data: {
            ...progressFixture,
            kpis: {
              recent: {
                workouts: 0,
                hardSets: 0,
                tonnageKg: 0,
                trainingDays: 0,
                adherence: null,
              },
              previous: {
                workouts: 0,
                hardSets: 0,
                tonnageKg: 0,
                trainingDays: 0,
                adherence: null,
              },
            },
            weeks: progressFixture.weeks.map((week) => ({
              ...week,
              workouts: 0,
              hardSets: 0,
              tonnageKg: 0,
            })),
            muscles: [],
            exercises: [],
            personalRecords: [],
            recentSessions: [],
          },
        }}
      />
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "No completed sets yet" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to today" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("hides sets that have no muscle assigned", () => {
    render(
      <ProgressDashboardView
        result={{
          ok: true,
          data: {
            ...progressFixture,
            muscles: [
              ...progressFixture.muscles,
              {
                muscleGroup: "unassigned",
                recentHardSets: 22,
                previousHardSets: 0,
              },
            ],
          },
        }}
      />
    );

    expect(screen.queryByText("Unassigned")).not.toBeInTheDocument();
    expect(screen.getByText("Glutes")).toBeInTheDocument();
  });
});
