---
name: tasks
description: Plan implementation from an approved journey spec or other agreed spec, as usable slices with dependencies, safe parallel work, builder notes and verification. Use for new apps or existing code before building; skip trivial edits.
---

# Tasks

You plan how the **builder** delivers an agreed spec: slices a person can use,
in an order that works, with proof each one is done. Follow the project's tracker
or task convention if it has one; otherwise write `docs/tasks/<feature>.md` using
the [task record](references/task-record.md). The checker below ships with the
journeys skill, at `journeys/scripts/journeys.ts` beside this skill's folder.

## Steps

1. **Read.** Read the spec, its decisions and the code it touches. For a journeys
   file, run `journeys.ts check <journeys file> --ready`; if approval is missing or
   stale, tell the owner and
   plan only what they ask for. Done when you know what exists, what is missing,
   and any accepted decision the journeys do not cover.

2. **Slice.** Group criteria into outcomes a person can use, end to end. A new app
   gets the minimum foundations folded into its first slice; existing code reuses
   what works and plans the gap; criteria the code already meets go in a task marked
   `Built` with the command that would verify them. Each criterion has one owning
   task; if only part of a criterion can be built now, split it in the journeys and
   re-approve. Include the delivery work too: landing the spec and decisions in the
   repo, migrations, configuration, and the project's own checks and gates. Done when
   every in-scope criterion and invariant has an owner.

3. **Order.** For each dependency, name the contract it needs and whether agreeing
   on that contract is enough to start. Say when each task can start (now, after a
   named task's contract, or after a named task) and, when it shares files, schema
   or migrations with another task, which one it merges after. Work outside this
   plan goes in a Blocked reason, not in Needs. Put shared schema in one early
   migration where you can, so later tasks run in parallel, and say which tasks must
   ship together so a person never meets a dead end. Done when every task says when
   it starts and what it merges after.

4. **Builder notes.** For each invariant, write how the builder will hold it:
   transactions, idempotency, retries, ordering. For each external system the task
   calls (payment, messaging, email, identity provider), add integration notes:
   calls made, idempotency, webhooks and their order, reconciling when its state
   drifts from ours, and how to test it. Done when every invariant and external
   system a task touches has a note.

5. **Verify.** Give each task a command or exact check, with the failure cases its
   criteria name, and the setup it needs (a test database, environment variables).
   A skipped test verifies nothing. Done when every task has one.

6. **Check.** For a journeys spec, stamp its approval in the Source line and run
   `bun <journeys-skill-dir>/scripts/journeys.ts tasks docs/tasks/<feature>.md`. It
   checks that every criterion and invariant is covered, every dependency is a real
   task, the order has no cycles, and the plan matches the current approval. Done
   when it passes. It checks ownership and order, not quality: review the slices,
   notes and verification yourself.

Planning surfaces product choices the spec does not settle: a status change, a
label, what happens at an edge. Raise each one as a question; a builder note only
says how, never what the person sees. Add the question to the decision record as a
Q line (the decide skill's format) and mark the affected task Blocked (Q<n>);
answering it may change the journeys and need re-approval.

Detail every task that can start now; give later ones a short entry with outcome,
dependencies, builder notes and verify. Link criterion IDs instead of copying their
text. Stop when the next slice is actionable. Reply with the next work, what
can run in parallel and blockers. Planning ends here: implementing, committing and
dispatching agents wait for the user.
