import {
  FEATURE_CATALOG,
  type FeatureAudience,
  type FeatureDefinition,
  type FeatureId,
  type FeatureRelease,
} from "./catalog";

function parseReleaseEnv(raw: string | undefined): FeatureRelease | null {
  if (raw == null || raw.trim() === "") return null;
  const value = raw.trim().toLowerCase();
  if (value === "on" || value === "true" || value === "1") return "on";
  if (value === "off" || value === "false" || value === "0") return "off";
  return null;
}

export function getFeatureRelease(feature: FeatureDefinition): FeatureRelease {
  const fromEnv = parseReleaseEnv(process.env[feature.envKey]);
  return fromEnv ?? feature.defaultRelease;
}

export function isFeatureReleased(id: FeatureId): boolean {
  return getFeatureRelease(FEATURE_CATALOG[id]) === "on";
}

export type AccessContext = {
  isAuthenticated: boolean;
  isPaid?: boolean;
};

export function audienceAllows(
  audience: FeatureAudience,
  ctx: AccessContext
): boolean {
  switch (audience) {
    case "public":
      return true;
    case "authenticated":
      return ctx.isAuthenticated;
    case "paid":
      return Boolean(ctx.isPaid);
  }
}

export function canAccessFeature(id: FeatureId, ctx: AccessContext): boolean {
  const feature = FEATURE_CATALOG[id];
  if (getFeatureRelease(feature) === "off") return false;
  return audienceAllows(feature.audience, ctx);
}

export function findFeatureByPath(pathname: string): FeatureDefinition | null {
  for (const feature of Object.values(FEATURE_CATALOG)) {
    if (pathname === feature.path || pathname.startsWith(`${feature.path}/`)) {
      return feature;
    }
  }
  return null;
}

export function canAccessPath(pathname: string, ctx: AccessContext): boolean {
  const feature = findFeatureByPath(pathname);
  if (!feature) return true;
  return canAccessFeature(feature.id, ctx);
}

export function filterEnabledNavItems<T extends { href: string }>(
  items: readonly T[],
  ctx: AccessContext
): T[] {
  return items.filter((item) => canAccessPath(item.href, ctx));
}

export function featureAccessFallbackPath(ctx: AccessContext): string {
  return ctx.isAuthenticated ? "/" : "/demo";
}
