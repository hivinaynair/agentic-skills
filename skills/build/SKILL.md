---
name: build
description: Implement one planned task, or fix one bug against a broken rule, so that the code, its tests, the task plan and the pull request stay tied to the approved spec. Use when asked to build a task from a task plan, implement the next slice, or fix a bug that breaks a criterion.
---

# Build

**For the owner:** nothing to do unless a rule turns out wrong or impossible; then you
get one question. You get a pull request that names the rules it implements and shows
their tests passing.

You turn one task from the plan in `docs/tasks/<feature>.md` into working code and a
pull request. The engineering itself follows the project: its framework skills,
conventions in `AGENTS.md`, and test-first practice. This skill keeps the work tied
to the spec. The checker is the journeys skill's `journeys/scripts/journeys.ts`,
beside this skill's folder.

## Rules

- The spec is fixed. Never change a criterion, a decision, a planned test name or
  the spec to make code pass. If a criterion proves wrong or impossible, stop and
  raise a Q line for the owner (the decide way); the task waits, Blocked (Q<n>).
- One task per pull request. Build only the criteria and invariants the task owns;
  anything else you notice becomes a note in the PR, not a change.
- Done needs evidence: the command run and its result, nothing skipped.

## Steps

1. **Pick and check.** Take the task you were given, or the next one the plan marks
   ready to start. Run `journeys.ts check docs/tasks/<feature>.md`; if the
   journeys' approval is stale or the plan reports it built on an older approval,
   stop and say so. Read the task's Covers, Provides, builder notes and Tests, and
   the code they name. Mark it In progress in the plan's index. Done when you can
   list the criteria you will build and the tests that prove them.

2. **Write the tests first.** Create each planned test with exactly the name and
   file the plan gives (`J3.S2.c1, J3.S2.c3: letters or code find offerings`), in the
   layer it names; a test that mocks the layer it proves proves nothing. Run them
   and see them fail for the right reason. Done when every owned criterion has a
   failing test.

3. **Implement.** Make the tests pass with the smallest change that fits the
   project's conventions, following the task's builder notes for each invariant:
   transactions, idempotency, ordering. Done when the task's tests pass.

4. **Run the task's Verify command** and the project's own checks (types, lint,
   the full test suite where it is fast). Done when everything passes with nothing
   skipped.

5. **Verify in the browser.** For a change people can see, run the verify skill if
   the project has it: every criterion checked on screen, fixed until it passes,
   then a walkthrough recorded. Done when every criterion shows as passing.

6. **Record.** In the plan, mark the task Done and add
   `Evidence: <command> — <result>` for each command from steps 4 and 5. Run
   `journeys.ts check docs/tasks/<feature>.md`; it confirms the named tests exist.
   Done when it passes.

7. **Open the pull request** with the project's template: its route, the criterion
   and invariant IDs it implements, the walkthrough, and the evidence. Committing
   and opening the PR follow the project's branch rules. Reply with the PR, what it
   covers and the next task that can start.

## Fixing a bug

Given a bug instead of a task, first find the criterion it breaks. If one does, write
a failing test named after it (`J3.S2.c4: …`), or note that the existing test with
that name passed wrongly, then run steps 3–7 against that criterion; no new approval
is needed, because the rule was already approved. If no criterion covers the
behavior, the right behavior is undecided: raise a Q line for the owner and fix it
once the answer is a decision and a criterion. A trivial fix with no rule behind it
(a typo, a style) needs none of this.
