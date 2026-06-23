import { describe, expect, it } from "vitest";
import { pageContentClassName } from "./page-content";

describe("pageContentClassName", () => {
  it("applies shared page padding", () => {
    expect(pageContentClassName()).toContain("px-4");
    expect(pageContentClassName()).toContain("py-6");
    expect(pageContentClassName()).toContain("lg:px-8");
    expect(pageContentClassName()).toContain("lg:py-8");
  });

  it("applies the requested max width", () => {
    expect(pageContentClassName("3xl")).toContain("max-w-3xl");
    expect(pageContentClassName("5xl")).toContain("max-w-5xl");
    expect(pageContentClassName("7xl")).toContain("max-w-7xl");
  });

  it("merges extra classes for page-specific layout", () => {
    expect(pageContentClassName("4xl", "flex-1 lg:px-0")).toContain("flex-1");
    expect(pageContentClassName("4xl", "flex-1 lg:px-0")).toContain("lg:px-0");
  });
});
