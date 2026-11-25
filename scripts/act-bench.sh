#!/usr/bin/env bash
# Runs the bench workflow's Linux job on this machine with nektos/act, to test a
# workflow change before it reaches GitHub. Flags that never change are in .actrc;
# this script adds the one that depends on the checkout's location: results/private/
# is mounted at /act-results, where the job writes its run (ARENA_RESULTS_DIR). The
# run is recorded as an "act" source and stays private, like any local path run.
#
#   pnpm bench:act                        # ubuntu-24.04, vite, 3 rounds
#   pnpm bench:act --input rounds=5       # any act flag or workflow input
#
# Only the bench job runs: publish would push to the data branch. macOS and Windows
# jobs need GitHub's own runners, and act ignores the workflow's concurrency rules.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

command -v act > /dev/null || { echo 'act is not installed: brew install act' >&2; exit 1; }
docker info > /dev/null 2>&1 || { echo 'Docker is not running' >&2; exit 1; }

mkdir -p results/private

exec act workflow_dispatch \
  -W .github/workflows/bench.yml \
  -j bench \
  --matrix runner:ubuntu-24.04 \
  --input projects=vite \
  --input rounds=3 \
  --input threads=default \
  --container-options "-v $root/results/private:/act-results" \
  "$@"
