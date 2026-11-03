import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EditorDay } from "../editorTypes";

const { getUserMock, insertTreeMock, revalidatePathMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  insertTreeMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: getUserMock },
  })),
}));

vi.mock("../insertActiveRoutineTree.server", () => ({
  insertActiveRoutineTree: insertTreeMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { createRoutine } from "./routineActions";

function validDay(): EditorDay {
  return {
    id: "new-day",
    name: "Day 1",
    focus: null,
    originalName: "Day 1",
    sortOrder: 0,
    exercises: [
      {
        id: "new-ex",
        name: "Squat",
        muscleGroup: "quads",
        secondaryMuscles: ["glutes"],
        sets: [
          { setType: "working", reps: "8", weightKg: "60" },
          { setType: "working", reps: "8", weightKg: "60" },
        ],
        restTime: null,
        notes: null,
        sortOrder: 0,
      },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
  insertTreeMock.mockResolvedValue({
    ok: true,
    routineId: "r1",
    dayCount: 1,
    exerciseCount: 1,
  });
});

describe("createRoutine", () => {
  it("inserts a manual active routine and revalidates", async () => {
    const result = await createRoutine({
      name: " Legs ",
      days: [validDay()],
    });

    expect(result).toEqual({ ok: true, routineId: "r1" });
    expect(insertTreeMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: "Legs",
        source: "manual",
      })
    );
    const [, input] = insertTreeMock.mock.calls[0];
    expect(input.days[0].exercises[0]).toMatchObject({
      name: "Squat",
      muscleGroup: "quads",
      secondaryMuscles: ["glutes"],
      sets: [
        { setType: "working", repsMin: 8, repsMax: 8, weightKg: 60 },
        { setType: "working", repsMin: 8, repsMax: 8, weightKg: 60 },
      ],
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
    expect(revalidatePathMock).toHaveBeenCalledWith("/editor");
  });

  it("rejects empty names and empty day lists", async () => {
    await expect(
      createRoutine({ name: "  ", days: [validDay()] })
    ).resolves.toEqual({ ok: false, error: "Routine name is required." });

    await expect(createRoutine({ name: "X", days: [] })).resolves.toEqual({
      ok: false,
      error: "Fix validation errors before saving your routine.",
    });

    expect(insertTreeMock).not.toHaveBeenCalled();
  });

  it("requires auth", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    await expect(
      createRoutine({ name: "X", days: [validDay()] })
    ).resolves.toEqual({ ok: false, error: "Not authenticated." });
  });
});
