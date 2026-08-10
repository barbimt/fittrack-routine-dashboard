# FitTrack product features

Next.js does **not** ship a product feature-flag system. FitTrack uses:

| Layer | Role |
|--------|------|
| `lib/features/catalog.ts` | Typed catalog: name, path, audience, default on/off |
| `lib/features/access.ts` | Can this user open this path / see this nav item? |
| `.env` / `.env.local` | Optional overrides (`NEXT_PUBLIC_FEATURE_*`) |
| Middleware | Enforces access; redirects away when blocked |

Local Cursor notes may also live under `docs/FEATURES.md` (gitignored). **This file is the published source of truth.**

## Turn a feature on

1. Open [`catalog.ts`](./catalog.ts) — find the feature (e.g. `weekOverview`).
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

Change `audience` in the catalog when the product decision changes — no scattered `if`s.

## Current gated surfaces

| Feature | Path | Default | Audience |
|---------|------|---------|----------|
| Week Overview | `/week` | `off` | authenticated |
| Progress | `/progress` | `off` | authenticated |

While `off`, links are hidden from nav and the middleware redirects `/week` and `/progress` to `/` (signed-in) or `/demo` (visitor).

## Add a new gated feature

1. Add an entry to `FEATURE_CATALOG` (+ extend `FeatureId`).
2. Point `path` at the route prefix.
3. Add the nav link to `ALL_NAV_ITEMS` / `ALL_PUBLIC_NAV_ITEMS` in the layout components (filtering is automatic).
4. Document the env key in `.env.example`.

## Paid plans (later)

Middleware already passes `isPaid: false`. When subscriptions exist, set `isPaid` from the user profile / Stripe and set `audience: "paid"` on premium features.
