# Cursor configuration for FitTrack

This folder configures AI assistants working in this repository.

## Contents

```
.cursor/
├── README.md           ← you are here
├── rules/              ← auto-attached conventions (.mdc)
└── skills/             ← on-demand workflows (SKILL.md)
```

## Also read

| File | Audience |
|------|----------|
| `AGENTS.md` | Agents — start here |
| `docs/CURSOR.md` | Humans — how to use rules & skills |
| `docs/ROADMAP.md` | What to build next |

## Skills index

| Skill | Use for |
|-------|---------|
| `fittrack-domain` | Types, mock data, progress math |
| `fittrack-ui` | Screens, components, design |
| `fittrack-workout-state` | Dashboard interactivity |
| `fittrack-excel-import` | Upload / .xlsx import |

## Rules index

| Rule | Scope |
|------|--------|
| `fittrack-project.mdc` | Always |
| `fitness-components.mdc` | `components/fitness/**` |
| `app-pages.mdc` | `app/**` |
| `design-system.mdc` | CSS / tokens |

After changing routes or domain types, update `AGENTS.md` and `docs/` to match.
