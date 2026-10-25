# Task record

One Markdown file per feature, unless the project has its own tracker.

```markdown
# Invitations tasks

Source: [journeys](../journeys/invitations.md), approved by D10 · Target: local

| ID | Outcome | Needs | Parallel | Status |
|---|---|---|---|---|
| T1 | Admin can create a share link | — | Start now | Todo |
| T2 | Teammate can join from the link | T1 invite contract | After the contract is agreed | Todo |

## T1 Create a share link
Covers: J1, I1.
Change: invite dialog, create endpoint, invites table (proposed paths).
Provides: invite contract — token, workspace, expiry, revoked state.
Builder notes:
- I1: check admin role inside the same request that writes the invite.
- Email provider: send after commit; dedupe by invite ID; a bounced send leaves the link valid; test with the provider's sandbox.
Verify: `bun test invites` — admin creates; non-admin is refused (J1.S1.c2).
```

- **Target** is where the slice must work to count as done: local, deployed or a pilot.
- **Covers** names journeys, criterion IDs or invariants. A whole journey means
  every one of its criteria.
- **Needs / Provides** name contracts between tasks and link the code that defines them.
- **Parallel:** start now, after a contract is agreed, or sequential, with the reason.
  Tasks touching the same files, schema or service run one after another.
- **Builder notes** say how each invariant holds, plus integration notes for each
  external system. Mechanics live here, not in decisions.
- **Status:** Todo, In progress, Blocked (reason), Done (evidence: command and result).
- Code done, integrated and deployed are separate evidence; record which one you have.

Before handing over, check: every in-scope criterion is covered once, every Needs
names a real task, and the order has no cycles.
