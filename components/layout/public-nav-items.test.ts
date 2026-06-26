import { describe, expect, it } from "vitest";
import { publicNavItems } from "./public-nav-items";

describe("publicNavItems", () => {
  it("uses unique hrefs for every public route", () => {
    const hrefs = publicNavItems.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("includes demo and showcase routes", () => {
    const hrefs = publicNavItems.map((item) => item.href);
    expect(hrefs).toEqual(
      expect.arrayContaining(["/demo", "/week", "/progress"])
    );
  });

  it("defines a label for each item", () => {
    for (const item of publicNavItems) {
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.href.startsWith("/")).toBe(true);
    }
  });
});
