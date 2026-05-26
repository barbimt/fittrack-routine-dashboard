# Working with Cursor on FitTrack

## What was added for AI context

| Asset | Location | Purpose |
|-------|----------|---------|
| Agent guide | `AGENTS.md` | Default instructions for agents |
| Rules | `.cursor/rules/*.mdc` | Auto-attached conventions |
| Skills | `.cursor/skills/*/SKILL.md` | Deep workflows on demand |
| Docs | `docs/*.md` | Architecture, domain, roadmap |

## How rules work

Rules in `.cursor/rules/` apply when:

- `alwaysApply: true` — every chat in this repo
- `globs: ...` — when you edit matching files

## How skills work

Mention or let the agent pick skills by description, e.g.:

- "Add workout state using the fittrack patterns"
- "Implement Excel import for the upload page"

Skills live under `.cursor/skills/` and are versioned with the repo.

## Tips for good prompts

1. Reference the phase in `docs/ROADMAP.md` ("Phase 1: workout state").
2. Say whether persistence is in scope for this task.
3. Ask to run `pnpm build` before finishing.
4. Prefer extending `components/fitness/*` over new one-off UI.

## Updating docs

When you add a route, change domain types, or finish a roadmap phase, update:

- `AGENTS.md` (if agent behavior should change)
- `README.md` (user-facing)
- `docs/ROADMAP.md` (checkboxes)
