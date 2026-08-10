/**
 * FitTrack product features — single source of truth.
 *
 * How to turn a WIP page on:
 *   1. Find it in `FEATURE_CATALOG` below
 *   2. Set `defaultRelease: "on"`, **or**
 *   3. Override in `.env.local`: `NEXT_PUBLIC_FEATURE_WEEK_OVERVIEW=on`
 *
 * Audience (who may use it once released):
 *   - public         → visitors + signed-in users
 *   - authenticated  → signed-in only
 *   - paid           → paid plan only (wire `AccessContext.isPaid` later)
 *
 * Used by: nav (sidebar / public nav), middleware, future paywall UI.
 * Docs: lib/features/README.md · env keys: .env.example
 */

export type FeatureId = "weekOverview" | "progress";

/** Who can use the feature after it is released. */
export type FeatureAudience = "public" | "authenticated" | "paid";

export type FeatureRelease = "on" | "off";

export type FeatureDefinition = {
  id: FeatureId;
  /** Short product name (docs / future admin). */
  name: string;
  description: string;
  /** Route prefix owned by this feature (`/week`, `/progress`, …). */
  path: string;
  audience: FeatureAudience;
  /**
   * Shipping default when no env override is set.
   * `off` = hidden from nav and blocked in middleware (WIP).
   */
  defaultRelease: FeatureRelease;
  /**
   * `NEXT_PUBLIC_*` so client nav and middleware stay in sync
   * (Next inlines these at build time — see Next.js env docs).
   */
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

export const FEATURE_IDS = Object.keys(FEATURE_CATALOG) as FeatureId[];
