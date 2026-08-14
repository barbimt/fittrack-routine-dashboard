# FitTrack

A practice project to get comfortable with **Next.js**, **React**, **TypeScript**, **Tailwind**, and **Supabase** (auth, Postgres, server actions). The domain is a weekly gym tracker so the UI and data model have something real to do.

You log **sets** as you train, edit the plan when it changes, or import a routine from Excel.

**[Open FitTrack](https://fittrack-routine-dashboard.vercel.app)** · [peek at a sample week without signing in](https://fittrack-routine-dashboard.vercel.app/demo)

## Using it

Sign in, then either import a spreadsheet or build the week in the editor. After that, Today is the screen you’ll live in:

- pick the day you’re training
- tick each set and jot the reps you actually did
- start a rest countdown when you want a pause
- tweak an exercise if the plan changed mid-session

Your routine stays on your account (email or Google). You can come back later and edit days, loads, or rest times.

The week overview and longer progress screens are sketched but not ready yet — they stay out of the way until they are.

## Running it on your machine

Node 20+, pnpm, and Docker.

```bash
pnpm install
cp .env.example .env.local
pnpm supabase:start && pnpm supabase:reset
```

Grab the local URL and anon key with `pnpm supabase:status -o env` and put them in `.env.local` (see `supabase/README.md`). Then `pnpm dev`.

From there: create an account, download the Excel template from the import page (or add a day in the editor), and open Today.

## Notes

If you’re poking around the code, [`docs/`](docs/README.md) has the longer write-ups.
