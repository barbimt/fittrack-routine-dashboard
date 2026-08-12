/**
 * FitTrack features API.
 *
 * @example
 * // Turn Week Overview on in .env.local:
 * // NEXT_PUBLIC_FEATURE_WEEK_OVERVIEW=on
 *
 * import { canAccessFeature, FEATURE_CATALOG } from "@/lib/features";
 */

export {
  FEATURE_CATALOG,
  type FeatureAudience,
  type FeatureDefinition,
  type FeatureId,
  type FeatureRelease,
} from "./catalog";

export {
  audienceAllows,
  canAccessFeature,
  canAccessPath,
  featureAccessFallbackPath,
  filterEnabledNavItems,
  findFeatureByPath,
  getFeatureRelease,
  isFeatureReleased,
  type AccessContext,
} from "./access";
