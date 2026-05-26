#!/usr/bin/env bash
# FitTrack — run before committing larger changes
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ pnpm lint"
pnpm lint
echo "→ pnpm build"
pnpm build
echo "✓ check passed"
