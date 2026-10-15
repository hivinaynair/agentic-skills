# Agentic Skills

Two skills for turning product intent into decisions and testable journeys.
Experimental v0.1. Start with one feature, then expand when useful.

| Skill | When to use it | Output |
|---|---|---|
| [decide](skills/decide/SKILL.md) | Requirements are uncertain or decisions need to survive a handoff | Accepted decisions, exclusions and open questions |
| [journeys](skills/journeys/SKILL.md) | Agreed behavior needs detailed paths, or existing behavior needs review | Coverage inventory, steps, branches, invariants and acceptance criteria |

The skills are ordinary Markdown instructions. They require no particular language,
framework, account or service. The optional validator uses Bun 1.4+ with no third-party
dependencies. These skills plan and review; they do not generate application code by default.

## Install

Copy the entire `skills/decide` and `skills/journeys` folders into your agent's skill
directory, preserving their references and scripts. Inspect the destination first;
do not overwrite existing skills with the same names. For a project that discovers
skills under `.agents/skills`, the result is:

```text
.agents/skills/
  decide/SKILL.md
  decide/references/
  journeys/SKILL.md
  journeys/references/
  journeys/scripts/
```

You can also point an agent directly at the two SKILL.md files without installing.
Discovery locations and invocation syntax depend on the agent. Explicit-path use
has been exercised in Codex; other agent installers have not been verified. There
is no agent-specific plugin manifest.

The previous seven skills and their installer have been retired from this repository.
Existing installed copies are not removed automatically. Git history retains the old files.

## Use

> Use decide to plan team invitations. Read our docs and code, preserve settled
> requirements, and ask about the most important missing policy.

> Use journeys on the agreed invitation feature. List actor goals and recovery
> paths first, then map steps, failures and acceptance criteria. Keep unknowns visible.

The workflow is:

1. Separate accepted decisions from observations, recommendations and questions.
2. Inventory actor goals and recovery paths before drawing the journeys.
3. Map each goal to journeys, an explicit exclusion, or an unresolved gap.
4. Describe each journey's steps, branches, outcomes and forbidden effects.
5. Validate references and review whether the behavior is actually sufficient.
6. Hand the resulting IDs to implementation tasks and tests.

Default artifacts are `docs/decisions.md` and `docs/journeys/<feature>.yaml`, plus
its generated Markdown view. Existing project conventions take precedence. The
optional checker expects the [decision table](skills/decide/references/record-format.md)
and [journey schema](skills/journeys/references/schema.md); existing formats may
need an explicit adapter or migration. The skills can still guide manual review.

Observed code behavior gets an observation ID with source, revision and locator.
It does not become approved policy just because it exists. Accepted decisions,
journey steps and criteria keep stable IDs so downstream work can cite them.

## Validate a feature

With the journeys folder installed at `.agents/skills/journeys`:

```sh
bun .agents/skills/journeys/scripts/journeys.ts validate docs/journeys/invitations.yaml
bun .agents/skills/journeys/scripts/journeys.ts render docs/journeys/invitations.yaml
bun .agents/skills/journeys/scripts/journeys.ts check docs/journeys/invitations.yaml --coverage
bun .agents/skills/journeys/scripts/journeys.ts check docs/journeys/invitations.yaml --ready
```

- `validate` checks structure and references; draft policy may produce warnings.
- `render` regenerates the Markdown tables and flowcharts.
- `check` also checks that generated Markdown is current.
- `--coverage` requires mapped goals or accepted exclusions and no unresolved goals.
- `--ready` additionally requires accepted policy and completed branch reviews.
  Observations alone cannot authorize readiness.

Optional verification maps link criteria to tests or other checks. Pass
`--verification docs/verification.json`; add `--require-links` to require a link
for every criterion and invariant. The checker verifies file/locator existence,
not execution or assertion quality. No command runs product tests.

## Pre-commit integration

Add this call to your existing hook manager when a feature is ready:

```sh
sh .agents/skills/journeys/scripts/pre-commit.sh docs/journeys/invitations.yaml --ready
```

Use `--coverage` for a source review that does not claim policy approval, or omit
both gates during drafting. The helper checks a temporary export of the staged
Git files without modifying or staging anything. An unstaged fix cannot disguise
a broken commit. Run the equivalent `check` in CI too; local hooks can be bypassed.
Do not overwrite an existing hook setup. Bun must be on PATH.

For development of this repository, `.githooks/pre-commit` optionally runs its
checks and tests against the staged snapshot. Enable it explicitly with
`git config core.hooksPath .githooks` if it fits your existing hook setup.

## Try the included example

```sh
bun run check
bun test
bun skills/journeys/scripts/journeys.ts check evaluation/team-invitations/journeys/invitations.yaml
```

The [invitation example](evaluation/team-invitations/journeys/invitations.md) is a
synthetic planning exercise, not an implemented app. Draft checking passes with
warnings; `--ready` deliberately fails. Read the [evaluation notes](evaluation/RESULTS.md).

## Limits

The validator catches broken references, unreachable steps, paths without exits,
reused retired IDs, missing forbidden-effect criteria, stale generated documents
and missing journeys referenced by the inventory.

It cannot discover a goal omitted from both the inventory and the graph, judge
whether a mapping actually covers a goal, verify the truth of source metadata,
or prove tests assert the intended behavior. Those require source and diff review.
A green check does not establish implementation correctness or complete coverage.

The tooling has been tested on macOS using Bun 1.4.0-canary.1. Stable-release Bun,
Windows hooks and cross-agent installation compatibility have not been verified.
No universal bug-prevention or measured productivity claim is made.

MIT licensed. Background inspiration includes [Superpowers](https://github.com/obra/superpowers),
[Spec Kit](https://github.com/github/spec-kit), [OpenSpec](https://github.com/Fission-AI/OpenSpec)
and the [Agent Skills format](https://agentskills.io/specification).
