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
Verify: `bun test invites` — admin creates; non-admin is refused (J1.S1.c2).
```

- **Source** links the journeys file and copies its `Approved:` stamp. When the
  journeys are re-approved, the `tasks` check reports the plan as stale.
- **Target** is where the slice must work to count as done: local, deployed or a pilot.
- **Covers** names journeys, steps, criterion IDs or invariants; a journey or step
  means all of its criteria. Notes in parentheses are ignored. Each criterion has one
  owning task; a later task that changes it says so in its builder notes.
- **Needs / Provides** name contracts between tasks and link the code that defines them.
- **Needs** names tasks in this plan it depends on, in the index or a `Needs:` line;
  both must agree. Work outside the plan goes in a Blocked reason.
- **Parallel:** when it can start (now, after a task's contract, after a task) and, if
  it shares files, schema or migrations, which task it merges after.
- **Builder notes** say how each invariant holds, plus integration notes for each
  external system the task calls. Mechanics live here, not in decisions.
- **Status:** Todo, Built (code exists; verify command not yet run), In progress,
  Blocked (reason, such as Q4 or an unbuilt feature), Done (evidence: command and result).
- Code done, integrated and deployed are separate evidence; record which one you have.

`bun <journeys-skill-dir>/scripts/journeys.ts tasks <file>` checks coverage,
dependencies, cycles and the approval stamp. It cannot judge whether the slices,
builder notes or verification are good; review those.
