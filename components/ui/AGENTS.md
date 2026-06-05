# UI primitives (shadcn)

Generated/maintained by [shadcn/ui](https://ui.shadcn.com/). Radix + Tailwind — **no FitTrack domain logic**.

## Rules

- Do not import workout types or Supabase here
- Prefer editing via `pnpm dlx shadcn@latest add …` when adding primitives
- Inline comments in these files are shadcn boilerplate — leave them when updating from CLI
- For branded controls in workout UI, wrap in `components/fitness/button.tsx` etc.

## Config

- `components.json` at repo root
- Theme tokens in `app/globals.css`
