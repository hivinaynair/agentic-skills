#!/bin/sh
# Opt-in hook helper. Validate the staged snapshot, not unrelated working-tree edits.
set -eu
checker_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
command -v bun >/dev/null 2>&1 || { echo 'journeys hook: Bun 1.4+ is required' >&2; exit 1; }
root=$(git rev-parse --show-toplevel)
cd "$root"
staged_dir=$(mktemp -d "${TMPDIR:-/tmp}/journeys-staged.XXXXXX")
trap 'rm -rf "$staged_dir"' EXIT HUP INT TERM
# checkout-index exports the index without changing the working tree or index.
git checkout-index --all --prefix="$staged_dir/"
cd "$staged_dir"
bun "$checker_dir/journeys.ts" check "$@"
