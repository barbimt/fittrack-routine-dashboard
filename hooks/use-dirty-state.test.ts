import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDirtyState } from "./use-dirty-state";

type Item = { id: string };

describe("useDirtyState", () => {
  it("starts clean with a cloned working copy", () => {
    const source: Item[] = [{ id: "a" }];
    const { result } = renderHook(() => useDirtyState(source));

    expect(result.current.isDirty).toBe(false);
    expect(result.current.value).toEqual(source);
    expect(result.current.value).not.toBe(source);
  });

  it("becomes dirty after a change and clean again when reverted", () => {
    const { result } = renderHook(() => useDirtyState<Item[]>([{ id: "a" }]));

    act(() => result.current.setValue([{ id: "a" }, { id: "b" }]));
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.setValue([{ id: "a" }]));
    expect(result.current.isDirty).toBe(false);
  });

  it("does not reseed when the source changes reference but not content", () => {
    const { result, rerender } = renderHook(
      ({ src }: { src: Item[] }) => useDirtyState(src),
      { initialProps: { src: [{ id: "a" }] } }
    );

    act(() => result.current.setValue([{ id: "a" }, { id: "b" }]));
    rerender({ src: [{ id: "a" }] }); // new reference, same content

    expect(result.current.isDirty).toBe(true);
    expect(result.current.value).toHaveLength(2);
  });

  it("reseeds value and baseline when the source content changes", () => {
    const { result, rerender } = renderHook(
      ({ src }: { src: Item[] }) => useDirtyState(src),
      { initialProps: { src: [{ id: "a" }] } }
    );

    act(() => result.current.setValue([{ id: "a" }, { id: "b" }]));
    rerender({ src: [{ id: "z" }] });

    expect(result.current.value).toEqual([{ id: "z" }]);
    expect(result.current.baseline).toEqual([{ id: "z" }]);
    expect(result.current.isDirty).toBe(false);
  });
});
