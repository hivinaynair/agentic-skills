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
| `.agents/skills/verify/` | A skill that checks a change in a browser against its success criteria, fixes and re-checks until all pass, then records a walkthrough for the PR. |
| `e2e/playwright.config.ts` | Journey tests that record video and a step-by-step trace of every run. |
| `.github/workflows/journeys.yml` | Runs the journey tests on every PR and posts a comment: each journey, its result, and its recordings. |
| `scripts/journey-report.mjs` | Builds that comment from Playwright's results. |
| `scripts/install-skills.sh` | Installs the planning skills (decide, journeys, tasks) and links every skill for each tool. |

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

For recordings, add Playwright to the project (`npm i -D @playwright/test`), put
journey tests in `e2e/journeys/`, and add these lines to `.gitignore`:

```
.verify/
e2e/report/
```

Set the repository variables `E2E_START_COMMAND` (how CI starts the app; default
`npm run dev`) or `E2E_BASE_URL` (a deployed preview to test instead). The verify skill
needs `ffmpeg` and agent-browser 0.41.0 (`npm i -g agent-browser@0.41.0`).

## What it deliberately leaves out

Framework skills (for Medusa, `medusajs/medusa-agent-skills`) and an engineering
workflow such as Superpowers are installed per developer through their tool's
plugin system; `docs/ai-workflow.md` says which ones the team uses.
