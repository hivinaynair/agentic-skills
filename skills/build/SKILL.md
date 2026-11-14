---
name: build
description: "Build an approved app release or feature in slices, implement a task test-first, fix a bug against an approved criterion, or build an approved design handoff. Use when asked to build an app, feature, task or slice, or implement approved designs."
compatibility: "Needs the journeys skill installed beside it (its scripts/journeys.ts checker) and Bun 1.4 or later."
---

# Build

**For the owner:** nothing to do unless a rule turns out wrong or impossible; then you
get one question. You get a pull request that names the rules it implements and shows
their tests passing.

You turn the requested scope into working code, taking one task at a time from
`docs/tasks/<feature>.md`. For an app, use the journeys index and every included
feature's plan. A request to build that scope authorizes continuing across its
slices without another approval; a request for one task stays within that task.
The engineering itself follows the project: its framework skills,
conventions in `AGENTS.md`, and test-first practice. This skill keeps the work tied
to the spec. The checker is the journeys skill's `journeys/scripts/journeys.ts`,
beside this skill's folder.

For a request to build approved designs, start with the
[design implementation intake](references/design-implementation.md).

## Rules

- The spec is fixed. Never change a criterion, a decision, a planned test name or
  the spec to make code pass. If a criterion proves wrong or impossible, stop that
  work and raise a Q line for the owner, with a recommendation, as decide does; the
  task waits, Blocked (Q<n>). Continue independent approved tasks.
- Follow the host project's branch and PR boundaries for the approved delivery;
  completing a task alone needs neither a PR nor an owner gate. Build only the criteria
  and invariants owned by the work in scope. PR boundaries do not require a new
  scope approval; Git and deployment actions follow the project's rules and the
  user's existing authorization.
- Done needs evidence: the command run and its result, nothing skipped.
- When something repeatedly costs time, name one concrete change that would help
  the next build, keep going on the approved scope, and include it in the PR.

## Steps

1. **Pick and check.** At intake, read the requested scope and completion condition
   and run `journeys.ts check <journeys file or app index> --ready`. Return unready
   specs to journeys before building their tasks. For an app, use tasks to fill
   missing feature plans. Take the task you were given, or the next ready task
   across the included plans, respecting dependencies and merge order. Recheck
   outside dependencies and clear their Blocked reason once satisfied.
   With no task plan yet, check whether the approved journeys fit
   one slice: one pull request, no shared schema or migration, and no external
   system such as payments or email. If they do, write `docs/tasks/<feature>.md` in
   the [task record](../tasks/references/task-record.md) format yourself: one task
   covering every criterion and invariant, one planned test named after each, and
   the project's test command as Verify; then stamp it with `journeys.ts approve
   <journeys file> <approval ID> docs/tasks/<feature>.md`. If they do not, plan with
   the tasks skill first. Run `journeys.ts check docs/tasks/<feature>.md`; if the
   journeys' approval is stale or the plan reports it built on an older approval,
   return the affected spec to journeys for review and skip its tasks until approval
   is current. Read the ready task's Covers, Provides, builder notes and Tests,
   and the code they name; detail its mechanics if it was a later, short entry.
   Mark it In progress in the plan's index. Done when you can list the criteria you
   will build and the tests that prove them.

2. **Build one criterion at a time.** Take the planned checks in order. For an
   automated test, write it under its planned name in the named layer, or reuse
   the named existing test. See it fail for the criterion's reason, make the
   smallest fix, and rerun the task's tests. For a `manual` entry, reproduce the
   failure when reachable, make the fix, then perform the named steps and record
   the observed result against its IDs. Use the browser pass below for manual UI
   checks. Done when every planned check passes.

3. **Tidy.** With every test passing, simplify the code this task touched: names,
   duplication, dead branches. Add no behavior, and keep every test passing.

4. **Run the task's Verify command** and the project's own checks (types, lint,
   the full test suite where it is fast). Done when everything passes with nothing
   skipped.

5. **Check the changed UI.** Use verify's focused mode for affected states and
   shared-component dependents, including the early design comparison. Reuse each
   state capture for its criteria. Save the full matrix and requested recording for
   final acceptance. Done when the affected checks pass; this is task evidence,
   not completion of the whole delivery.

6. **Record.** In the plan, mark the task Done and add
   `Evidence: <command> — <result>` for each command from steps 4 and 5. Run
   `journeys.ts check docs/tasks/<feature>.md`; it confirms the named automated
   tests exist. Include the observed result of each manual check in the evidence.
   Done when it passes.

7. **Continue.** Take the next ready task in the requested scope, repeating steps
   1–6 without asking for slice
   approval. If unfinished tasks remain but none can proceed, report their blockers
   and evidence; otherwise finish with step 8.

8. **Accept and hand over.** At a delivery boundary, run the planned integration
   checks and the project's gates on the combined app, including journeys that cross
   features and affected existing behavior. Use one final verify pass for visible
   flows and the complete design scope, reusing it for both PR evidence and completion.
   Check every included plan and the app index when present. Open or update the PR
   with its route, criterion IDs and evidence, following project rules. An intermediate
   delivery reports its explicit subset and remaining scope. Done means all requested
   work, including reused `Built` behavior, is verified at the agreed target and
   the completion condition is met. Report the
   PRs and evidence, distinguishing code, integration and deployment; any blocked or
   unverified work leaves the requested scope incomplete.

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
that name passed wrongly, then make it pass and run steps 3–8 against that
criterion; no new approval is needed, because the criterion was already approved.
If no criterion covers the behavior, the right behavior is undecided: raise a Q line
for the owner and fix it once the answer is a decision and a criterion. A trivial
fix with no criterion behind it (a typo, a style) needs none of this.
