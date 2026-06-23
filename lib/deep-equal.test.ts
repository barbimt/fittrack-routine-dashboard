import { describe, expect, it } from "vitest";
import { deepEqual } from "./deep-equal";

describe("deepEqual", () => {
  it("treats primitives by value", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("a", "a")).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it("compares nested objects regardless of key order", () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: { c: 3 } }, { a: { c: 3 } })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("compares arrays element-wise and is order sensitive", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual([{ id: "a" }], [{ id: "a" }])).toBe(true);
  });

  it("distinguishes arrays from objects", () => {
    expect(deepEqual([], {})).toBe(false);
  });

  it("handles editor-shaped nested structures", () => {
    const a = [{ id: "d1", exercises: [{ id: "e1", sets: 4 }] }];
    const b = [{ id: "d1", exercises: [{ id: "e1", sets: 4 }] }];
    const c = [{ id: "d1", exercises: [{ id: "e1", sets: 5 }] }];
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });
});
