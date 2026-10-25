# Task record

One Markdown file per feature, unless the project has its own tracker.

```markdown
# Invitations tasks

Source: [journeys](../journeys/invitations.md), approved by D10 3f9a1c2e · Target: local

| ID | Outcome | Needs | Parallel | Status |
|---|---|---|---|---|
| T1 | Admin can create a share link | — | Start now | Todo |
| T2 | Teammate can join from the link | T1 invite contract | After the contract is agreed | Todo |
| T3 | Admin can revoke a link | T1 | After T1's contract; merge after T1 (shares `invites.ts`) | Todo |

## T1 Create a share link
Covers: J1, I1.
Change: invite dialog, create endpoint, invites table (proposed paths).
Provides: invite contract — token, workspace, expiry, revoked state.
Builder notes:
- I1: check admin role inside the same request that writes the invite.
- Email provider: send after commit; dedupe by invite ID; a bounced send leaves the link valid; test with the provider's sandbox.
Verify: `bun test invites` (0 skipped).
Tests:
- J1.S1.c1, J1.S1.c2: src/invites.test.ts › admin creates; non-admin is refused
- J1.S1.c3: src/invites.test.ts › malformed email shows a field error
- J1.S2.c1: manual › create an invite and copy the link with its expiry
- I1: src/invites.test.ts › role is checked in the same request that writes
```

- **Source** links the journeys file and copies its `Approved:` stamp. When the
  journeys are re-approved, the `tasks` check reports the plan as stale.
- **Target** is where the slice must work to count as done: local, deployed or a pilot.
- **Covers** names journeys, steps, criterion IDs or invariants; a journey or step
  means all of its criteria. Notes in parentheses are ignored. Each criterion has one
  owning task; a later task that changes it says so in its builder notes. When only
  part of a criterion can be built now, the task building that part owns it and notes
  the rest, and the owner is asked to split it. Delivery-only work uses `Covers: none`.
- **Needs / Provides** name contracts between tasks and link the code that defines them.
- **Needs** names tasks in this plan it depends on, in the index or a `Needs:` line;
  both must agree. Work outside the plan goes in a Blocked reason.
- **Parallel:** when it can start (now, after a task's contract, after a task) and, if
  it shares files, schema or migrations, which task it merges after.
- **Builder notes** say how each invariant holds, plus integration notes for each
  external system the task calls; a system it only reads needs one line. Mechanics
  live here, not in decisions.
- **Tests** maps each criterion and invariant the task owns to the test that proves
  it: `- J1.S1.c1: path/to/file.test.ts › test name`, or `manual › what to do`. Paths
  are from the repository root; run the check there.
- **Walkthrough** (last task of a slice): the journeys walked as the person would,
  e.g. `Walkthrough: J1 on My bookings: cancel one date, a closed date, a stranger's
  link, a repeated tap`, or `Blocked (reason)` when it cannot run yet.
- **Status:** Todo, Built (this journey's own path already works in code; its named
  tests must exist; behavior reached only through another path is not Built), In progress,
  Blocked (reason, such as Q4 or an unbuilt feature), or Done with an `Evidence:` line
  giving the command run and its result. A Done task's named tests must exist.
- Code done, integrated and deployed are separate evidence; record which one you have.

`bun <journeys-skill-dir>/scripts/journeys.ts tasks <file>` checks ownership, named
tests, dependencies, cycles, Done evidence and the approval stamp; `--status` lists
each criterion's task, test and status. It cannot judge whether the slices, builder
notes or tests are good; review those.
