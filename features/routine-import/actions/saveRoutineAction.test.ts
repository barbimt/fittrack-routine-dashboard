import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ParsedRoutine } from "@/features/routine-import/types";

const {
  getUserMock,
  fromMock,
  insertTreeMock,
  redirectMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  fromMock: vi.fn(),
  insertTreeMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  })),
}));

vi.mock("@/features/routines/insertActiveRoutineTree", () => ({
  insertActiveRoutineTree: insertTreeMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { saveRoutine } from "./saveRoutineAction";

function makeRoutine(): ParsedRoutine {
  return {
    name: "Imported",
    source: "excel",
    warnings: [],
    days: [
      {
        name: "Day 1",
        originalName: "Day 1",
        focus: null,
        sortOrder: 0,
        exercises: [
          {
            name: "Squat",
            prescription: "3x8",
            plannedSets: 3,
            targetReps: "8",
            weight: null,
            notes: null,
            sortOrder: 0,
          },
        ],
      },
    ],
  };
}

function deleteChain(result: { error: { message: string } | null }) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.delete = vi.fn(self);
  chain.eq = vi.fn(self);
  chain.then = (
    onFulfilled?: (value: typeof result) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  redirectMock.mockImplementation(() => {
    throw new Error("NEXT_REDIRECT");
  });
  getUserMock.mockResolvedValue({
    data: { user: { id: "user-1" } },
    error: null,
  });
  fromMock.mockReturnValue(deleteChain({ error: null }));
});

describe("saveRoutine", () => {
  it("redirects to / after a successful insert", async () => {
    insertTreeMock.mockResolvedValue({
      ok: true,
      routineId: "r1",
      dayCount: 1,
      exerciseCount: 1,
    });

    await expect(saveRoutine(makeRoutine())).rejects.toThrow("NEXT_REDIRECT");

    expect(insertTreeMock).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("returns an error without redirecting", async () => {
    insertTreeMock.mockResolvedValue({
      ok: false,
      error: "Failed to save routine.",
    });

    const result = await saveRoutine(makeRoutine());

    expect(result).toEqual({ ok: false, error: "Failed to save routine." });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const result = await saveRoutine(makeRoutine());

    expect(result).toEqual({
      ok: false,
      error: "You must be signed in to save a routine.",
    });
    expect(insertTreeMock).not.toHaveBeenCalled();
  });
});
