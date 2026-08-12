/**
 * Allowlisted relative paths for post-auth redirects (`?next=`).
 * Rejects protocol-relative URLs, backslashes, and unknown routes.
 */
const ALLOWED_EXACT = new Set([
  "/",
  "/empty",
  "/upload",
  "/editor",
  "/settings",
  "/week",
  "/progress",
  "/demo",
]);

export function sanitizeAuthRedirectPath(
  raw: string | null | undefined,
  fallback = "/"
): string {
  if (raw == null || raw === "") return fallback;

  let candidate = raw.trim();
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    return fallback;
  }

  if (!candidate.startsWith("/")) return fallback;
  // Block protocol-relative and scheme smuggling (`//evil`, `/\evil`, `/\\`)
  if (candidate.startsWith("//") || candidate.includes("\\")) return fallback;
  if (candidate.includes("://")) return fallback;

  const pathOnly = candidate.split(/[?#]/, 1)[0] ?? candidate;
  if (ALLOWED_EXACT.has(pathOnly)) return pathOnly;

  return fallback;
}
