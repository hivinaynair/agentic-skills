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

## Review evidence

Reviewers should see a change work before reading its code.

- **Demo, before the PR.** For a change people can see, the agent runs the demo
  skill: a short video and a screenshot of every state, including failures, in the
  PR's Walkthrough section. It shows the change once.
- **Journey recordings, on every push.** Tests in `e2e/journeys/` are named after
  the journey or rule they prove (`J3: pay with coins at checkout`). CI runs them
  with video and a step-by-step trace, and comments on the PR with each journey's
  result. They prove the rules still hold.
- **Where media lives.** <Where the team keeps PR videos: dragged into the PR
  (GitHub plays MP4 inline), or a shared bucket.> CI recordings stay in the run's
  artifacts for 14 days.

Reviewers watch the walkthrough and check the journey table, then read the risky
parts of the code: money, permissions, data, migrations.

## Pull requests

Every PR uses the template: its route, what was asked, the spec IDs it implements
(risky work), and evidence (commands run and their output). The author can explain
every line, whoever or whatever wrote it.
