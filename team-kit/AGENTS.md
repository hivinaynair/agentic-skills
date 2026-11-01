# <Product name>

<One sentence: what this product is and who uses it.>

Every AI agent working in this repository reads this file: Claude Code, Cursor,
Copilot and Codex. Keep it short; it is loaded on every task.

## How we work with agents

Read [docs/ai-workflow.md](docs/ai-workflow.md). In short, route each change:

- **Small and precise** (copy, styling, a clear bug fix): build it, open a PR.
- **Normal feature**: write a short plan in the PR description first, then build
  with tests.
- **Risky** (money, permissions, customer data, anything crossing features): plan
  with the decide and journeys skills, get the PM's approval of the summary page,
  then plan tasks and build. Do not start code before approval.

For a change people can see, run the verify skill before opening the PR: it checks
every success criterion in a browser, fixes what fails, and records a walkthrough.
Never change the criteria, the spec or the tests to make a check pass.

Never decide a product rule yourself. If a ticket leaves a rule open (who may do
something, what a person sees, what happens to money), ask, or record it as an
open question for the owner.

## Stack

- <Framework and version, e.g. Medusa v2 on Node 20>
- <Database, queue, hosting>
- <Package manager: do not use another one>

## Commands

```sh
<install command>
<dev server>
<tests>
<lint and types>
```

Run the tests and checks before saying a change is done, and show their output.

## Conventions

- <Where code goes: modules, workflows, API routes, storefront>
- <Naming and patterns the team insists on>
- <What not to touch without asking: migrations, payment settings, production config>

## Specs

Approved specs live in `docs/decisions.md`, `docs/journeys/` and `docs/tasks/`.
Code and tests that implement a spec cite its IDs (`J2.S3.c1`, `I2`) in test names
and PR descriptions. Check a spec with
`bun .agents/skills/journeys/scripts/journeys.ts check <file>`.
