export type FeatureId = "weekOverview" | "progress";

export type FeatureAudience = "public" | "authenticated" | "paid";

export type FeatureRelease = "on" | "off";

export type FeatureDefinition = {
  id: FeatureId;
  name: string;
  description: string;
  path: string;
  audience: FeatureAudience;
  /** Used when `NEXT_PUBLIC_FEATURE_*` is unset. `off` hides nav and blocks the route. */
  defaultRelease: FeatureRelease;
  /** Inlined at build time so client nav and middleware agree. */
  envKey: `NEXT_PUBLIC_FEATURE_${string}`;
};

export const FEATURE_CATALOG: Record<FeatureId, FeatureDefinition> = {
  weekOverview: {
    id: "weekOverview",
    name: "Week Overview",
    description:
      "Weekly training summary across days. Still mock data — keep off until live sessions power it.",
    path: "/week",
    audience: "authenticated",
    defaultRelease: "off",
    envKey: "NEXT_PUBLIC_FEATURE_WEEK_OVERVIEW",
  },
  progress: {
    id: "progress",
    name: "Progress",
    description:
      "Long-term analytics and PRs. Still placeholder UI — keep off until analytics exist.",
    path: "/progress",
    audience: "authenticated",
    defaultRelease: "off",
    envKey: "NEXT_PUBLIC_FEATURE_PROGRESS",
  },
};
