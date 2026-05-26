---
name: fittrack-ui
description: >-
  Build and extend FitTrack UI screens and components with Tailwind, shadcn, and
  the calm premium design system. Use for new pages, fitness components, layout,
  empty states, upload UI, or design token changes.
---

# FitTrack UI

## Checklist for new UI

1. Reuse `AppShell` + existing fitness components
2. Match tokens in `app/globals.css` — no hardcoded hex unless extending theme
3. Mobile-first: `min-h-11` touch targets, `pb-24` for bottom nav
4. Desktop: sidebar visible `lg+`; summary `aside` on `xl+` when useful

## Component placement

| Need | Where |
|------|--------|
| Workout widget | `components/fitness/` |
| Nav chrome | `components/layout/` |
| Primitive button/input | `components/ui/` (shadcn) |
| Branded button/input/badge | `components/fitness/button.tsx` etc. |

## New screen template

```tsx
"use client";
import { AppShell } from "@/components/app-shell";

export default function Page() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Title</h1>
          <p className="mt-1 text-muted-foreground">Subtitle</p>
        </header>
        {/* sections */}
      </div>
    </AppShell>
  );
}
```

## Card pattern

`bg-card rounded-2xl border border-border p-5 shadow-sm`

## See also

- `docs/ARCHITECTURE.md` — layering
- Rule `design-system.mdc` — tokens
