import { describe, expect, it } from "vitest";
import { buildProgressBrief, buildProgressJson } from "./brief";
import { progressFixture } from "./fixture";
import { parseProgressDashboard } from "./schema";

describe("progress brief", () => {
  const brief = buildProgressBrief(progressFixture);
  const json = buildProgressJson(progressFixture);

  it("uses the same exercise names and set numbers as the payload", () => {
    expect(parseProgressDashboard(progressFixture).exercises[0]?.hardSets).toBe(
      12
    );
    expect(brief).toContain("Hip Thrust");
    expect(brief).toContain("Lat Pulldown");
    expect(brief).toContain("80 kg × 8");
    expect(brief).toContain("| Hip Thrust | 12 |");
    expect(json).toContain("Hip Thrust");
    const parsed = JSON.parse(json) as typeof progressFixture;
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.exercises[0]).toMatchObject({
      name: "Hip Thrust",
      hardSets: 12,
    });
    expect(parsed.recentSessions[0]?.exercises[0]).toMatchObject({
      name: "Hip Thrust",
      bestWeightKg: 80,
      bestReps: 8,
    });
  });

  it("states definitions and the data that was not recorded", () => {
    expect(brief).toContain("## Definitions");
    expect(brief).toContain(progressFixture.definitions.hardSet);
    expect(brief).toContain("## Not tracked");
    expect(brief).toContain("RPE or reps in reserve");
    expect(brief).toContain("Body weight");
    expect(brief).toContain("Waist and hip measurements");
    expect(brief).toContain("Best gain: Hip Thrust");
    expect(
      buildProgressBrief({
        ...progressFixture,
        muscles: [
          ...progressFixture.muscles,
          {
            muscleGroup: "unassigned",
            recentHardSets: 22,
            previousHardSets: 0,
          },
        ],
      })
    ).not.toContain("Unassigned");
    expect(brief).toContain("Do not invent missing data");
  });

  it("leaves out account identifiers", () => {
    const combined = `${brief}\n${json}`;
    expect(combined).not.toMatch(/@/);
    expect(combined).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
  });
});
