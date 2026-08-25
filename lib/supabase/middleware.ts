import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  canAccessPath,
  featureAccessFallbackPath,
  findFeatureByPath,
  getFeatureRelease,
} from "@/lib/features";
import { sanitizeAuthRedirectPath } from "@/lib/auth/safe-redirect-path";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not add logic between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;
  const accessCtx = {
    isAuthenticated: Boolean(user),
    isPaid: false,
  };

  // OAuth PKCE code must hit /auth/callback. If Auth falls back to site_url
  // (or middleware bounced "/" → "/login" keeping ?code=), recover here.
  const authCode = searchParams.get("code");
  if (authCode && !pathname.startsWith("/auth/callback")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    const safeNext = sanitizeAuthRedirectPath(
      callbackUrl.searchParams.get("next") ?? pathname,
      "/"
    );
    callbackUrl.searchParams.set("next", safeNext);
    const redirectResponse = NextResponse.redirect(callbackUrl);
    redirectResponse.headers.set("X-Frame-Options", "DENY");
    redirectResponse.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'none'"
    );
    return redirectResponse;
  }

  if (!canAccessPath(pathname, accessCtx)) {
    const fallbackUrl = request.nextUrl.clone();
    fallbackUrl.pathname = featureAccessFallbackPath(accessCtx);
    fallbackUrl.search = "";
    return NextResponse.redirect(fallbackUrl);
  }

  const gated = findFeatureByPath(pathname);
  const isReleasedPublicFeature =
    gated != null &&
    getFeatureRelease(gated) === "on" &&
    gated.audience === "public";

  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/preview") ||
    isReleasedPublicFeature;

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
