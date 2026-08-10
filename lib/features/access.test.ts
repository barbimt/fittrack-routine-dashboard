import { describe, expect, it, afterEach, vi } from "vitest";
import {
  FEATURE_CATALOG,
  audienceAllows,
  canAccessFeature,
  filterEnabledNavItems,
  getFeatureRelease,
  isFeatureReleased,
} from "./index";

describe("feature catalog", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("documents week and progress as WIP by default", () => {
    expect(FEATURE_CATALOG.weekOverview.defaultRelease).toBe("off");
    expect(FEATURE_CATALOG.progress.defaultRelease).toBe("off");
    expect(FEATURE_CATALOG.weekOverview.audience).toBe("authenticated");
    expect(FEATURE_CATALOG.progress.audience).toBe("authenticated");
    expect(isFeatureReleased("weekOverview")).toBe(false);
    expect(isFeatureReleased("progress")).toBe(false);
  });

  it("honours NEXT_PUBLIC_FEATURE_* env overrides", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_WEEK_OVERVIEW", "on");
    expect(getFeatureRelease(FEATURE_CATALOG.weekOverview)).toBe("on");
    expect(isFeatureReleased("weekOverview")).toBe(true);
  });

  it("blocks released authenticated features for visitors", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_PROGRESS", "on");
    expect(
      canAccessFeature("progress", { isAuthenticated: false })
    ).toBe(false);
    expect(
      canAccessFeature("progress", { isAuthenticated: true })
    ).toBe(true);
  });

  it("requires isPaid for paid audience", () => {
    expect(audienceAllows("paid", { isAuthenticated: true })).toBe(false);
    expect(
      audienceAllows("paid", { isAuthenticated: true, isPaid: true })
    ).toBe(true);
  });

  it("filters app nav for signed-in users", () => {
    const items = filterEnabledNavItems(
      [
        { href: "/", label: "Today" },
        { href: "/week", label: "Week" },
        { href: "/progress", label: "Progress" },
        { href: "/editor", label: "Editor" },
      ],
      { isAuthenticated: true }
    );
    expect(items.map((item) => item.href)).toEqual(["/", "/editor"]);
  });

  it("keeps authenticated features out of the public nav even if released", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_WEEK_OVERVIEW", "on");
    const items = filterEnabledNavItems(
      [
        { href: "/demo", label: "Demo" },
        { href: "/week", label: "Week" },
      ],
      { isAuthenticated: false }
    );
    expect(items.map((item) => item.href)).toEqual(["/demo"]);
  });
});
