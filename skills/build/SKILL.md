---
name: build
description: "Implements one planned task test-first, or fixes one bug against an approved criterion: one criterion at a time (failing test, least code, next), only the tests the plan names, evidence recorded, and a pull request naming the criteria it implements. Use when asked to build, implement or code the next task or slice from a task plan, work test-first or TDD on a spec'd feature, pick up a ticket that has an approved spec, or fix a bug that breaks a criterion in the spec."
compatibility: "Needs the journeys skill installed beside it (its scripts/journeys.ts checker) and Bun 1.4 or later."
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
  raise a Q line for the owner, with a recommendation, as the decide skill does; the
  task waits, Blocked (Q<n>).
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

2. **Build one criterion at a time.** Take the task's planned tests in order. For
   each: write that one test under exactly its planned name, in the layer it names;
   run it and see it fail for the reason the criterion gives; write the least code
   that makes it pass; run all of the task's tests. Then the next. Writing every test
   first and all the code after tests the shape you imagined, not what the code
   turned out to need. Done when every planned test passes.

3. **Tidy.** With every test passing, simplify the code this task touched: names,
   duplication, dead branches. Add no behavior, and keep every test passing.

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

## Only the tests the plan names

The task plan already agreed what to test: one test per criterion or invariant,
named after it. Those tests are the budget. A pile of extra tests slows every
change after this one and hides the tests that matter.

- Write a test only when you can name the criterion or invariant it proves. Add one
  beyond the plan only for a bug you found while building (name it after the
  criterion it protects) or for a criterion its planned test cannot reach; list each
  extra test and its reason in the PR.
- Test through the public interface the criterion describes: the function, endpoint
  or screen a caller uses. A test that breaks when you refactor but behavior stays
  the same is testing internals.
- Take expected values from the spec or a worked example, never recomputed the way
  the code computes them; a test that cannot disagree with the code proves nothing.
- Mock only system boundaries: payment providers, email, time. Never your own
  modules.
- Do not test private helpers, framework behavior, what the type checker already
  proves, or many variations of one rule; one clear example per criterion is enough.

[Good and bad tests](references/tests.md) and [when to mock](references/mocking.md)
show each with examples. They are adapted from Matt Pocock's `tdd` skill (MIT; see
[the license](references/LICENSE-tdd.txt)).

## Fixing a bug

Given a bug instead of a task, first find the criterion it breaks. If one does, write
a failing test named after it (`J3.S2.c4: …`), or note that the existing test with
that name passed wrongly, then make it pass and run steps 3–7 against that
criterion; no new approval is needed, because the criterion was already approved.
If no criterion covers the behavior, the right behavior is undecided: raise a Q line
for the owner and fix it once the answer is a decision and a criterion. A trivial
fix with no criterion behind it (a typo, a style) needs none of this.
