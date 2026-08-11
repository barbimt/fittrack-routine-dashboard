import { describe, expect, it, beforeEach } from "vitest";
import type { TrainingDay } from "@/lib/mock-data";
import {
  assignTrainingDaySlugs,
  findTrainingDayBySlug,
  slugifyTrainingDayLabel,
  todayHrefFromRememberedDay,
  trainingDaySlug,
  DAY_SLUG_STORAGE_KEY,
} from "./trainingDaySlug";

const day = (id: string, focus: string, dayName = "Monday"): TrainingDay => ({
  id,
  dayName,
  focus,
  exercises: [],
});

describe("trainingDaySlug", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("slugifies focus labels for readable URLs", () => {
    expect(slugifyTrainingDayLabel("Glutes & Hamstrings")).toBe(
      "glutes-hamstrings"
    );
    expect(trainingDaySlug(day("1", "Glutes"))).toBe("glutes");
  });

  it("dedupes colliding focuses", () => {
    const days = [
      day("a", "Glutes"),
      day("b", "Glutes"),
      day("c", "Upper Body"),
    ];
    const slugs = assignTrainingDaySlugs(days);
    expect(slugs.get("a")).toBe("glutes");
    expect(slugs.get("b")).toBe("glutes-2");
    expect(slugs.get("c")).toBe("upper-body");
  });

  it("finds a day by slug", () => {
    const days = [day("a", "Glutes"), day("b", "Push")];
    expect(findTrainingDayBySlug(days, "push")?.id).toBe("b");
    expect(findTrainingDayBySlug(days, "missing")).toBeUndefined();
  });

  it("builds Today href from a remembered slug", () => {
    sessionStorage.setItem(DAY_SLUG_STORAGE_KEY, "glutes");
    expect(todayHrefFromRememberedDay()).toBe("/?day=glutes");
  });
});
