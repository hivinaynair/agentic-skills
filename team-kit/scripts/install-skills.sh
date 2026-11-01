#!/bin/sh
# Installs the decide, journeys and tasks skills into .agents/skills and links them
# for Claude Code (.claude/skills) and Cursor (.cursor/skills). Re-run to update.
set -eu
repo=${AGENTIC_SKILLS_REPO:-https://github.com/hivinaynair/agentic-skills.git}
ref=${AGENTIC_SKILLS_REF:-main}
tmp=$(mktemp -d "${TMPDIR:-/tmp}/agentic-skills.XXXXXX")
trap 'rm -rf "$tmp"' EXIT HUP INT TERM
git clone --quiet --depth 1 --branch "$ref" "$repo" "$tmp/src"
mkdir -p .agents/skills .claude/skills .cursor/skills
for name in decide journeys tasks; do
  rm -rf ".agents/skills/$name"
  cp -R "$tmp/src/skills/$name" ".agents/skills/$name"
  for tool in .claude .cursor; do
    rm -rf "$tool/skills/$name"
    ln -s "../../.agents/skills/$name" "$tool/skills/$name"
  done
done
echo "Installed decide, journeys and tasks from $repo@$ref into .agents/skills."
