#!/bin/sh
# Opt-in hook helper. Validate the staged snapshot, not unrelated working-tree edits.
set -eu
checker_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
command -v bun >/dev/null 2>&1 || { echo 'journeys hook: Bun 1.4+ is required' >&2; exit 1; }
root=$(CDPATH= cd -- "$(git rev-parse --show-toplevel)" && pwd -P)
cd "$root"
# Inputs must resolve inside the exported index, not the working tree.
relative_path() {
  case "$1" in
    ''|/*|..|../*|*/../*|*/..) echo 'journeys hook: use repository-relative paths without .. segments' >&2; exit 1 ;;
  esac
}
[ "$#" -gt 0 ] || { echo 'journeys hook: provide a repository-relative feature path' >&2; exit 1; }
relative_path "$1"
verification_path=false
for arg in "$@"; do
  if [ "$verification_path" = true ]; then relative_path "$arg"; verification_path=false; fi
  if [ "$arg" = --verification ]; then verification_path=true; fi
done
staged_dir=$(mktemp -d "${TMPDIR:-/tmp}/journeys-staged.XXXXXX")
trap 'rm -rf "$staged_dir"' EXIT HUP INT TERM
# checkout-index exports the index without changing the working tree or index.
git checkout-index --all --prefix="$staged_dir/"
case "$checker_dir" in
  "$root") checker="$staged_dir/journeys.ts"; local_checker=true ;;
  "$root/"*) checker="$staged_dir/${checker_dir#"$root/"}/journeys.ts"; local_checker=true ;;
  *) checker="$checker_dir/journeys.ts"; local_checker=false ;; # Personal/external installation is outside this index.
esac
[ -f "$checker" ] || { echo 'journeys hook: stage the repository-local validator before running the hook' >&2; exit 1; }
if [ "$local_checker" = true ]; then
  # Check the staged executable before running it; its filename can be a symlink too.
  bun -e '
    const {realpathSync} = require("node:fs");
    const {relative, isAbsolute, sep} = require("node:path");
    const fromRoot = relative(realpathSync(process.argv[1]), realpathSync(process.argv[2]));
    if (fromRoot === ".." || fromRoot.startsWith(".." + sep) || isAbsolute(fromRoot)) {
      console.error("journeys hook: validator escapes staged snapshot"); process.exit(1);
    }
  ' "$staged_dir" "$checker"
fi
cd "$staged_dir"
JOURNEYS_SNAPSHOT_ROOT="$staged_dir" bun "$checker" check "$@"
