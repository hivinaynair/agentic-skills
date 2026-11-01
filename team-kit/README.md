# Team kit

A starter for a team that uses AI coding agents across several tools (Claude Code,
Cursor, Copilot, Codex). Copy it into a product repository, fill in the
placeholders, and the team has one way of working with agents.

| File | What it does |
|---|---|
| `AGENTS.md` | The one set of instructions every agent reads. Fill in the `<…>` parts. |
| `.github/copilot-instructions.md` | Points Copilot at `AGENTS.md`. |
| `docs/ai-workflow.md` | The team guide: the five layers and which changes take which path. |
| `.github/pull_request_template.md` | Every PR says how it was routed, what rules it implements and its evidence. |
| `.github/workflows/specs.yml` | Checks specs on PRs that change them. |
| `scripts/install-skills.sh` | Installs the planning skills (decide, journeys, tasks) for every tool. |

Claude Code (2.1.277 or later), Cursor and Codex read `AGENTS.md` directly; check
that your versions do. Claude Code reads it only when there is no `CLAUDE.md`, so
do not add one: put every instruction in `AGENTS.md`.

## Install

From the product repository's root:

```sh
cp -R path/to/agentic-skills/team-kit/. .
sh scripts/install-skills.sh
```

Then fill in `AGENTS.md`, read `docs/ai-workflow.md` with the team, and commit.
The spec check in CI needs nothing but Bun, which the workflow installs.

## What it deliberately leaves out

Framework skills (for Medusa, `medusajs/medusa-agent-skills`) and an engineering
workflow such as Superpowers are installed per developer through their tool's
plugin system; `docs/ai-workflow.md` says which ones the team uses.
