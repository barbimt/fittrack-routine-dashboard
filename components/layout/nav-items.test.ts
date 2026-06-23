import { describe, expect, it } from "vitest";
import { navItems } from "./sidebar";

describe("navItems", () => {
  it("uses unique hrefs for every route", () => {
    const hrefs = navItems.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("includes primary app routes", () => {
    const hrefs = navItems.map((item) => item.href);
    expect(hrefs).toEqual(
      expect.arrayContaining(["/", "/upload", "/week", "/editor", "/settings"])
    );
  });

  it("defines a label for each item", () => {
    for (const item of navItems) {
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.href.startsWith("/")).toBe(true);
    }
  });
});
