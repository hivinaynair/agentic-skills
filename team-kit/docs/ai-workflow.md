# How we work with AI agents

One way of working across Claude Code, Cursor and Copilot. Agents follow
`AGENTS.md`; people follow this page.

## The five layers

| Layer | Question | What we use |
|---|---|---|
| 1. Shared context | What does every agent need to know? | `AGENTS.md`, edited by the whole team |
| 2. What to build | Are the product rules decided and approved? | decide and journeys skills, risky work only |
| 3. How to build | Does the agent build it the right way? | <framework skills, e.g. Medusa's `medusa-dev`>, tests first, small PRs |
| 4. Verification | Does it work, and what else could it break? | Tests named after spec rules, <e2e tool>, the spec check, CI |
| 5. Review | Can a person trust and explain it? | The PR template; a human reviews every PR |

## Routing

| Change | Example | What you do |
|---|---|---|
| Small and precise | Copy, styling, a clear bug fix | Build, PR, review |
| Normal feature | A new product filter | Short plan in the PR, build with tests, review |
| Risky | Money, permissions, customer data, crossing features | The spec workflow below, then build |

When unsure, treat it as risky and ask in the PR.

## The spec workflow for risky changes

1. **Decide.** Ask the agent: "Use decide to plan <feature>." When the PM owns the
   answers, it gives you one list of questions to send, each with a recommendation.
   Paste the answers back; it records each as one line.
2. **Journeys.** "Map the journeys for <feature>." The agent writes what people see,
   step by step, including errors, and checks it.
3. **Approve.** Send the PM the summary page (`check <journeys file> --summary`). Their
   yes is recorded; any later change to the rules makes it stale until they approve again.
4. **Tasks.** "Plan the tasks for <feature>." Every rule gets an owning task and a
   named test.
5. **Build.** Tests cite the rule IDs; the PR names them and shows the test output.

Before changing an approved rule, ask the agent for the impact
(`check <journeys file> --impact D<n>`): which steps, tests and approvals it touches.
The report covers mapped features only; tests are the safety net for the rest.

## Pull requests

Every PR uses the template: its route, what was asked, the spec IDs it implements
(risky work), and evidence (commands run and their output). The author can explain
every line, whoever or whatever wrote it.
