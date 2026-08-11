import { describe, expect, it } from "vitest";
import {
  readSelectedDayCookie,
  SELECTED_DAY_COOKIE,
} from "./selectedDayCookie";

const DAY_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const DAY_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

describe("readSelectedDayCookie", () => {
  it("returns the day id when it belongs to the routine", () => {
    expect(readSelectedDayCookie(DAY_B, [DAY_A, DAY_B])).toBe(DAY_B);
  });

  it("ignores missing, non-uuid, or unknown day ids", () => {
    expect(readSelectedDayCookie(undefined, [DAY_A])).toBeNull();
    expect(readSelectedDayCookie("glutes", [DAY_A])).toBeNull();
    expect(readSelectedDayCookie(DAY_B, [DAY_A])).toBeNull();
  });

  it("exports a stable cookie name", () => {
    expect(SELECTED_DAY_COOKIE).toBe("fittrack_selected_day");
  });
});
