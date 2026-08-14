# FitTrack

Practice project for **Next.js**, **React**, **TypeScript**, **Tailwind**, and **Supabase**.

It’s a weekly workout tracker: log sets, edit the routine, or import one from Excel.

[Live app](https://fittrack-routine-dashboard.vercel.app) · [demo without an account](https://fittrack-routine-dashboard.vercel.app/demo)

## Local setup

Node 20+, pnpm, Docker.

```bash
pnpm install
cp .env.example .env.local
pnpm supabase:start && pnpm supabase:reset
```

Copy the URL and anon key from `pnpm supabase:status -o env` into `.env.local`, then `pnpm dev`. Details: [`supabase/README.md`](supabase/README.md).
