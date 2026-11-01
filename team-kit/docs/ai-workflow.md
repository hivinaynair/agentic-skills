# How we work with AI agents

One way of working across Claude Code, Cursor and Copilot. Agents follow
`AGENTS.md`; people follow this page.

## The five layers

| Layer | Question | What we use |
|---|---|---|
| 1. Shared context | What does every agent need to know? | `AGENTS.md`, edited by the whole team |
| 2. What to build | Are the product rules decided and approved? | decide (owner approves) and journeys (independent review), risky work only |
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

1. **Decide.** Ask the agent: "Use decide to plan <feature>." When someone else owns
   the answers, it gives you one list of questions to send, each with a
   recommendation. Paste the answers back; it records each as one line.
2. **Owner approves the decisions.** The agent asks the owner to approve the rules
   for the first slice, including its assumptions. This is the owner's only sign-off.
3. **Journeys.** "Map the journeys for <feature>." The agent writes what people see,
   step by step, including errors. A separate reviewer agent checks every step
   follows an approved decision and adds no rule; a rule nobody decided goes back to
   the owner as a question. Then the spec is stamped ready.
4. **Tasks.** "Plan the tasks for <feature>." Every rule gets an owning task and a
   named test.
5. **Build.** "Build the next task for <feature>." The build skill writes the planned
   tests first, implements, runs the verify skill for visible changes, records the
   evidence in the task plan and opens the PR. A bug that breaks an approved rule
   goes the same way: a failing test named after the rule, then the fix.

`check <journeys file> --summary` prints a plain page to share with the owner or the
team. Any later change to an approved decision makes the journeys' approval stale
until they are reviewed again.

Before changing an approved rule, ask the agent for the impact
(`check <journeys file> --impact D<n>`): which steps, tests and approvals it touches.
The report covers mapped features only; tests are the safety net for the rest.

## Review evidence

Reviewers should see a change work before reading its code.

- **Verified, before the PR.** For a change people can see, the agent runs the
  verify skill: it opens the app, checks every success criterion in a browser,
  fixes what fails and checks again (at most three rounds), then records a
  walkthrough. The PR's Walkthrough section lists each criterion with its result
  and screenshot. The agent may change only product code to pass, never the
  criteria or tests.
- **Journey recordings, on every push.** Tests in `e2e/journeys/` are named after
  the journey or rule they prove (`J3: pay with coins at checkout`). CI runs them
  with video and a step-by-step trace, and comments on the PR with each journey's
  result. They prove the rules still hold.
- **Where media lives.** <Where the team keeps PR videos: dragged into the PR
  (GitHub plays MP4 inline), or a shared bucket.> CI recordings stay in the run's
  artifacts for 14 days.

- **Exploratory check, for risky changes.** After the criteria pass, the verify skill
  runs agent-browser's bundled `dogfood` skill on the changed area and the flows next
  to it. It explores like a user and reports bugs with repro videos, covering what no
  journey maps. The agent fixes only what its change caused, raises undecided
  behavior as a question for the owner, and lists older bugs without fixing them.
- **Before a release.** Someone runs `dogfood` across the whole app on staging and
  turns its findings into tickets.

Reviewers watch the walkthrough and check the journey table, then read the risky
parts of the code: money, permissions, data, migrations.

## Pull requests

Every PR uses the template: its route, what was asked, the spec IDs it implements
(risky work), and evidence (commands run and their output). The author can explain
every line, whoever or whatever wrote it.
