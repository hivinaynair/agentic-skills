---
name: journeys
description: Map how people move through a feature, from goal to every outcome they can see, as screens, steps and testable criteria, ending in an owner-approved spec ready to build. Use after decisions exist, to map user journeys, check a spec is ready, or reconstruct a feature from existing code.
---

# Journeys

You map each person's path through a feature, from their goal to every outcome
they can see. Write one Markdown file per feature, `docs/journeys/<feature>.md`,
in the [journey format](references/format.md). Every step rests on owner decisions
in the project's decision record. Ask missing product questions the decide way:
one at a time, with a recommendation, recorded as a Q line.

## Steps

1. **Goals.** List every actor goal for this feature from the decisions and sources,
   including recovery goals such as a link that stopped working. Mark each one mapped
   to journeys, excluded by an accepted X, covered elsewhere (another spec), or
   unresolved. Done when every goal of this feature has a line.

2. **Journeys.** Write each path from the person's first action to every exit.
   Person steps name the screen and what the person sees, including pending, empty
   and error states. System steps hold the rules a person never sees directly.
   Criteria are short: `When <condition>: <behavior>.` One fact lives in one place:
   decisions every step shares go on the journey's `Basis:`, outcomes every journey
   shares in the header's `Checks:`, and a "never" rule in an invariant that steps
   name in `Guards:` rather than restate. Done when every step reaches an exit and
   the checker reports no over-long lines.

3. **Invariants.** Write the few "never" rules that hold across paths, such as
   "never two memberships per account". Races, duplicate events and crashes become
   invariants; the builder decides how to hold them. Done when every money, access
   and data-integrity effect has an invariant.

4. **Outcome checks.** Answer [denied, invalid, failed and repeated](references/checks.md)
   for each journey: cite criteria or decisions, mark n/a with a reason, or mark open
   with the blocking Q. Done when every journey answers all four.

5. **Check and review.** List the decisions this feature must honor on a `Scope:`
   line. Run `bun <skill-dir>/scripts/journeys.ts check docs/journeys/<feature>.md`
   and fix every error. Then run `check --review` and read each step beside the text
   it rests on: every criterion follows from it, each criterion is one behavior, and
   nothing contradicts another decision. Fix the spec or ask. Done when both pass.

6. **Ready.** When `check --ready` fails only on approval, give the owner a short
   Ready summary: goals covered, non-goals, screens, external systems involved
   (payment, messaging, identity providers), builder work left, and other specs
   that cite a decision this one supersedes. Ask "Approve for build?". On yes,
   add `- D<n> accepted — Approved for build: <feature> J1–J<n>` to the decision
   record and run `approve docs/journeys/<feature>.md D<n>`. Done when
   `check --ready` passes.

Changing the journeys or the decisions they cite makes the approval stale; repeat
Ready. If the project keeps an index of journeys, add this file to it. For an
existing feature, start with [existing code](references/existing-projects.md).
Reply with what changed, open questions and the next step. An approved spec is
complete enough to build; tests and running code prove the behavior.
