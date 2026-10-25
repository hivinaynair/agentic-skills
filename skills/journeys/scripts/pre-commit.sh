#!/bin/sh
# Opt-in hook helper. Check the staged snapshot, not unrelated working-tree edits.
set -eu
checker_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
command -v bun >/dev/null 2>&1 || { echo 'journeys hook: Bun 1.4+ is required' >&2; exit 1; }
root=$(CDPATH= cd -- "$(git rev-parse --show-toplevel)" && pwd -P)
cd "$root"
# The feature must resolve inside the exported index, not the working tree.
case "${1:-}" in
  ''|/*|..|../*|*/../*|*/..) echo 'journeys hook: use a repository-relative feature path without .. segments' >&2; exit 1 ;;
esac
staged_dir=$(mktemp -d "${TMPDIR:-/tmp}/journeys-staged.XXXXXX")
trap 'rm -rf "$staged_dir"' EXIT HUP INT TERM
# checkout-index exports the index without changing the working tree or index.
git checkout-index --all --prefix="$staged_dir/"
case "$checker_dir" in
  "$root") checker="$staged_dir/journeys.ts"; local_checker=true ;;
  "$root/"*) checker="$staged_dir/${checker_dir#"$root/"}/journeys.ts"; local_checker=true ;;
  *) checker="$checker_dir/journeys.ts"; local_checker=false ;; # Personal/external installation is outside this index.
esac
[ -f "$checker" ] || { echo 'journeys hook: stage the repository-local checker before running the hook' >&2; exit 1; }
if [ "$local_checker" = true ]; then
  # Check the staged executable before running it; its filename can be a symlink too.
  bun -e '
    const {realpathSync} = require("node:fs");
    const {relative, isAbsolute, sep} = require("node:path");
    const fromRoot = relative(realpathSync(process.argv[1]), realpathSync(process.argv[2]));
    if (fromRoot === ".." || fromRoot.startsWith(".." + sep) || isAbsolute(fromRoot)) {
      console.error("journeys hook: checker escapes staged snapshot"); process.exit(1);
    }
  ' "$staged_dir" "$checker"
fi
cd "$staged_dir"
JOURNEYS_SNAPSHOT_ROOT="$staged_dir" bun "$checker" check "$@"
