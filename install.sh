#!/usr/bin/env bash
set -euo pipefail

SKILLS_DIR="$HOME/.claude/skills"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$SKILLS_DIR"

SKILL_NAMES=("worth-it" "nah-fam" "lets-cook" "show-me" "tdd" "brainstorming")

for skill_name in "${SKILL_NAMES[@]}"; do
  skill_dir="$SCRIPT_DIR/$skill_name"
  target="$SKILLS_DIR/$skill_name"

  if [ -L "$target" ]; then
    echo "  updating $skill_name (removing old symlink)"
    rm "$target"
  elif [ -d "$target" ]; then
    echo "  skipping $skill_name (directory already exists — remove it first if you want to replace)"
    continue
  fi

  ln -s "$skill_dir" "$target"
  echo "  installed $skill_name"
done

echo ""
echo "Done. 6 skills installed to $SKILLS_DIR"
