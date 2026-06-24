import { describe, expect, it, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { DragEndEvent } from "@dnd-kit/core";
import type { EditorRoutine } from "@/features/routines/editorTypes";

const { updateRoutineMock, refreshMock } = vi.hoisted(() => ({
  updateRoutineMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/features/routines/actions/routineActions", () => ({
  updateRoutine: updateRoutineMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { useRoutineEditor } from "./use-routine-editor";

const DAY_ID = "11111111-1111-4111-8111-111111111111";
const EX_ID = "22222222-2222-4222-8222-222222222222";

function makeRoutine(): EditorRoutine {
  return {
    id: "routine-1",
    name: "My routine",
    days: [
      {
        id: DAY_ID,
        name: "Day 1",
        focus: "Glutes",
        originalName: "Day 1",
        sortOrder: 0,
        exercises: [
          {
            id: EX_ID,
            name: "Hip Thrust",
            muscleGroup: "Glutes",
            prescription: "4x10",
            plannedSets: 4,
            targetReps: "10",
            weight: "60kg",
            restTime: null,
            notes: null,
            sortOrder: 0,
          },
        ],
      },
    ],
  };
}

function dragEvent(activeId: string, overId: string): DragEndEvent {
  return {
    active: { id: activeId },
    over: { id: overId },
  } as unknown as DragEndEvent;
}

beforeEach(() => {
  vi.clearAllMocks();
  updateRoutineMock.mockResolvedValue({ ok: true });
});

describe("useRoutineEditor", () => {
  it("starts clean with a cloned working copy", () => {
    const routine = makeRoutine();
    const { result } = renderHook(() => useRoutineEditor(routine));

    expect(result.current.isDirty).toBe(false);
    expect(result.current.days).toHaveLength(1);
    expect(result.current.days).not.toBe(routine.days);
  });

  it("marks dirty when an exercise field changes", () => {
    const routine = makeRoutine();
    const { result } = renderHook(() => useRoutineEditor(routine));

    act(() => result.current.updateExercise(DAY_ID, EX_ID, { plannedSets: 5 }));

    expect(result.current.days[0].exercises[0].plannedSets).toBe(5);
    expect(result.current.isDirty).toBe(true);
  });

  it("adds a day and expands it", () => {
    const { result } = renderHook(() => useRoutineEditor(makeRoutine()));

    act(() => result.current.addDay());

    expect(result.current.days).toHaveLength(2);
    expect(result.current.expandedDayId).toBe(result.current.days[1].id);
  });

  it("adds and removes exercises", () => {
    const { result } = renderHook(() => useRoutineEditor(makeRoutine()));

    act(() => result.current.addExercise(DAY_ID));
    expect(result.current.days[0].exercises).toHaveLength(2);

    act(() => result.current.deleteExercise(DAY_ID, EX_ID));
    expect(result.current.days[0].exercises.some((ex) => ex.id === EX_ID)).toBe(
      false
    );
  });

  it("defaults new exercises to a simple prescription", () => {
    const { result } = renderHook(() => useRoutineEditor(makeRoutine()));

    act(() => result.current.addExercise(DAY_ID));

    const added = result.current.days[0].exercises.find(
      (ex) => ex.id !== EX_ID
    );
    expect(added).toMatchObject({
      prescription: "3x12",
      plannedSets: 3,
      targetReps: "12",
      weight: null,
    });
  });

  it("saves variable prescription changes in the patch", async () => {
    const { result } = renderHook(() => useRoutineEditor(makeRoutine()));

    act(() =>
      result.current.updateExercise(DAY_ID, EX_ID, {
        prescription: "1x12 15kg-3x12 20kg",
        plannedSets: 4,
        targetReps: "12",
        weight: null,
      })
    );

    await act(async () => {
      await result.current.save();
    });

    expect(updateRoutineMock).toHaveBeenCalledTimes(1);
    expect(updateRoutineMock.mock.calls[0][0].upsertExercises[0]).toMatchObject(
      {
        id: EX_ID,
        prescription: "1x12 15kg-3x12 20kg",
        plannedSets: 4,
        weight: null,
      }
    );
  });

  it("reorders days", () => {
    const { result } = renderHook(() => useRoutineEditor(makeRoutine()));

    act(() => result.current.addDay());
    const [first, second] = result.current.days.map((d) => d.id);

    act(() => result.current.reorderDays(dragEvent(second, first)));

    expect(result.current.days.map((d) => d.id)).toEqual([second, first]);
  });

  it("blocks save and reports errors when a day has no exercises", async () => {
    const { result } = renderHook(() => useRoutineEditor(makeRoutine()));

    act(() => result.current.deleteExercise(DAY_ID, EX_ID));
    await act(async () => {
      await result.current.save();
    });

    expect(result.current.dayErrors.length).toBeGreaterThan(0);
    expect(updateRoutineMock).not.toHaveBeenCalled();
  });

  it("saves only the changed exercise and refreshes on success", async () => {
    const { result } = renderHook(() => useRoutineEditor(makeRoutine()));

    act(() => result.current.updateExercise(DAY_ID, EX_ID, { weight: "70kg" }));
    await act(async () => {
      await result.current.save();
    });

    expect(updateRoutineMock).toHaveBeenCalledTimes(1);
    const patch = updateRoutineMock.mock.calls[0][0];
    expect(patch.upsertExercises).toHaveLength(1);
    expect(patch.upsertExercises[0]).toMatchObject({
      id: EX_ID,
      weight: "70kg",
    });
    expect(patch.upsertDays).toHaveLength(0);
    expect(result.current.saved).toBe(true);
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces the server error on a failed save", async () => {
    updateRoutineMock.mockResolvedValue({ ok: false, error: "boom" });
    const { result } = renderHook(() => useRoutineEditor(makeRoutine()));

    act(() => result.current.updateExercise(DAY_ID, EX_ID, { weight: "70kg" }));
    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveError).toBe("boom");
    expect(result.current.saved).toBe(false);
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
