import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { insertActiveRoutineTree } from "./insertActiveRoutineTree";

type QueryResult = { data: unknown; error: { message: string } | null };

function createThenable(result: QueryResult) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.update = vi.fn(self);
  chain.insert = vi.fn(self);
  chain.eq = vi.fn(self);
  chain.select = vi.fn(self);
  chain.single = vi.fn(() => Promise.resolve(result));
  // Supabase builders are thenable for terminal calls without .single()
  chain.then = (
    onFulfilled?: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return chain;
}

describe("insertActiveRoutineTree", () => {
  const fromMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deactivates existing actives and inserts routine, day, and exercises", async () => {
    let routinesFromCount = 0;
    const deactivate = createThenable({ data: null, error: null });
    const routineInsert = createThenable({
      data: { id: "routine-1" },
      error: null,
    });
    const dayInsert = createThenable({ data: { id: "day-1" }, error: null });
    const exerciseInsert = createThenable({ data: null, error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === "routines") {
        routinesFromCount += 1;
        return routinesFromCount === 1 ? deactivate : routineInsert;
      }
      if (table === "routine_days") return dayInsert;
      if (table === "routine_exercises") return exerciseInsert;
      throw new Error(`unexpected table ${table}`);
    });

    const supabase = { from: fromMock } as unknown as SupabaseClient;

    const result = await insertActiveRoutineTree(supabase, {
      userId: "user-1",
      name: "Push Pull",
      source: "manual",
      days: [
        {
          name: "Day 1",
          focus: "Push",
          originalName: "Day 1",
          sortOrder: 0,
          exercises: [
            {
              name: "Bench",
              prescription: "3x10",
              plannedSets: 3,
              targetReps: "10",
              weight: null,
              notes: null,
              sortOrder: 0,
            },
          ],
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      routineId: "routine-1",
      dayCount: 1,
      exerciseCount: 1,
    });
    expect(deactivate.update).toHaveBeenCalled();
    expect(routineInsert.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        name: "Push Pull",
        source: "manual",
        is_active: true,
      })
    );
    expect(exerciseInsert.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Bench",
          prescription: "3x10",
          routine_day_id: "day-1",
        }),
      ])
    );
  });

  it("returns an error when deactivate fails", async () => {
    const deactivate = createThenable({
      data: null,
      error: { message: "nope" },
    });
    fromMock.mockReturnValue(deactivate);
    const supabase = { from: fromMock } as unknown as SupabaseClient;

    const result = await insertActiveRoutineTree(supabase, {
      userId: "user-1",
      name: "X",
      source: "excel",
      days: [],
    });

    expect(result).toEqual({
      ok: false,
      error: "Failed to update existing routines.",
    });
  });
});
