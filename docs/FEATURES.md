# FitTrack product features

> **Source of truth:** [`lib/features/README.md`](../lib/features/README.md)

Next.js does **not** ship a product feature-flag system. FitTrack uses:

| Layer | Role |
|--------|------|
| `lib/features/catalog.ts` | Typed catalog: name, path, audience, default on/off |
| `lib/features/access.ts` | Can this user open this path / see this nav item? |
| `.env` / `.env.local` | Optional overrides (`NEXT_PUBLIC_FEATURE_*`) |
| Middleware | Enforces access; redirects away when blocked |

## Turn a feature on

1. Open [`lib/features/catalog.ts`](../lib/features/catalog.ts) — find the feature (e.g. `weekOverview`).
2. Either set `defaultRelease: "on"`, **or** in `.env.local`:

```bash
NEXT_PUBLIC_FEATURE_WEEK_OVERVIEW=on
NEXT_PUBLIC_FEATURE_PROGRESS=on
```

3. Restart `pnpm dev` (Next inlines `NEXT_PUBLIC_*` at startup/build).

Values accepted: `on` / `off` (also `true`/`false`/`1`/`0`).

## Audience (who can use it once released)

| `audience` | Meaning |
|------------|---------|
| `public` | Visitors + signed-in users (good for demos) |
| `authenticated` | Signed-in only (Week / Progress today) |
| `paid` | Requires `AccessContext.isPaid` (wire when billing exists) |

## Add a new gated feature

1. Add an entry to `FEATURE_CATALOG` (+ extend `FeatureId`).
2. Point `path` at the route prefix.
3. Add the nav link to `ALL_NAV_ITEMS` / `ALL_PUBLIC_NAV_ITEMS` (filtering is automatic).
4. Document the env key in `.env.example`.
5. Update [`lib/features/README.md`](../lib/features/README.md).

## Paid plans (later)

Middleware already passes `isPaid: false`. When subscriptions exist, set `isPaid` from the user profile / Stripe and set `audience: "paid"` on premium features.
