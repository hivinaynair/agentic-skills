---
name: journeys
description: "Maps how people move through a feature as screens, steps and testable criteria that follow the owner's approved decisions, including what happens when someone is not allowed, enters bad input, hits a failure or repeats an action, then passes an independent review and a checker before build. Use after decisions exist, when asked to map user journeys or flows, write user stories or acceptance criteria, check a spec is ready to build, or reconstruct how an existing feature behaves from its code. Not for visual design or wireframes."
compatibility: "Needs Bun 1.4 or later for the checker in scripts/journeys.ts."
---

# Journeys

**For the owner:** you approve nothing here. The journeys must follow the decisions you
approved; you are asked again only when they need a rule you have not decided. You get
`docs/journeys/<feature>.md`. The agent runs the checker.

You map each person's path through a feature, from their goal to every outcome
they can see. Write one Markdown file per feature, `docs/journeys/<feature>.md`,
in the [journey format](references/format.md). Every step rests on owner decisions
in the project's decision record. Never add a rule: when a step needs one that no
accepted decision states, record it as a Q line or an `Assumed:` draft and send it
to the owner as the decide skill does: one list of questions, each with a
recommendation. The spec is not ready until the owner has answered.

## Steps

1. **Goals.** List every actor goal for this feature from the decisions and sources,
   including recovery goals such as a link that stopped working. Mark each one mapped
   to journeys, excluded by an accepted X, covered elsewhere (another spec), or
   unresolved. Done when every goal of this feature has a line.

2. **Journeys.** Write each path from the person's first action to every exit.
   Person steps name the screen and what changes for the person there, not what an
   earlier step already showed. Pending, empty, denied and error states are branches
   that reach an outcome: a payment still pending shows "Checking payment", and
   reopening the order shows the verified result. System steps hold the rules a
   person never sees directly. Criteria are short: `When <condition>: <behavior>.`
   One fact lives in one place: decisions every step shares go on the journey's
   `Basis:`, outcomes every journey shares in the header's `Checks:`, and a "never"
   rule in an invariant that steps name in `Guards:` rather than restate. A `Basis:`
   cites only the decisions its criteria follow from. Past 20 words, split a
   criterion in two or move a shared condition to an invariant; never drop a
   condition, number or scope to fit. Done when every step reaches an exit.

3. **Invariants.** Write the few "never" rules that hold across paths, such as
   "never two memberships per account". Races, duplicate events and crashes become
   invariants; the builder decides how to hold them. Done when every money, access
   and data-integrity effect has an invariant.

4. **Outcome checks.** Answer [denied, invalid, failed and repeated](references/checks.md),
   plus any check the project index requires, for each journey: cite criteria or decisions, mark n/a with a reason, or mark open
   with the blocking Q. Done when every journey answers all four.

5. **Check and review.** List the decisions and questions this feature must settle
   on a `Scope:` line. Run `bun <skill-dir>/scripts/journeys.ts check docs/journeys/<feature>.md`
   and fix every error. Then run `check --review` and read each step beside the text
   it rests on: every criterion follows from it, each criterion is one behavior, and
   nothing contradicts another decision. Fix the spec or ask. Done when both pass.

6. **Independent review.** When `check --ready` fails only on approval, have the
   spec checked by a reviewer that did not write it: a fresh subagent if you can
   start one, given only the decision record, the journeys file and the
   `check --review` output; otherwise reread it as a demanding outsider. It reports
   every step that does not follow from what it cites, every cited decision its
   criteria do not use, every rule no accepted decision states, and every failure
   case left vague. Fix the spec, or send new
   rules to the owner as questions. When the review passes, add
   `- D<n> accepted — Approved for build: <feature> J1–J<n>, independent review passed`
   and run `approve docs/journeys/<feature>.md D<n>`, naming any task plan after it
   so its stamp updates too. Done when `check --ready` passes. `check --summary`
   gives a plain page to share with the owner or the team; it is information, not
   a gate.

Changing the journeys or the decisions they cite makes the approval stale; repeat
the review. When the project grows past one spec, list this file in the
[project index](references/format.md#when-your-project-grows) and `check` the index too; fix
its errors and any `elsewhere:` it flags. For an existing feature, start with [existing code](references/existing-projects.md).
Reply with what changed, open questions and the next step. An approved spec is
complete enough to build; tests and running code prove the behavior.
