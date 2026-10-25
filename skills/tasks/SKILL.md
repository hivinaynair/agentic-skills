---
name: tasks
description: Plan implementation from an approved journey spec or other agreed spec, as usable slices with dependencies, safe parallel work, builder notes and verification. Use for new apps or existing code before building; skip trivial edits.
---

# Tasks

You plan how the **builder** delivers an agreed spec: slices a person can use,
in an order that works, with proof each one is done. Follow the project's tracker
or task convention if it has one; otherwise write `docs/tasks/<feature>.md` using
the [task record](references/task-record.md).

## Steps

1. **Read.** Read the spec, its decisions and the code it touches. For a journeys
   file, run `check --ready`; if approval is missing or stale, tell the owner and
   plan only what they ask for. Done when you know what exists, what is missing,
   and any accepted decision the journeys do not cover.

2. **Slice.** Group criteria into outcomes a person can use, end to end. A new app
   gets the minimum foundations folded into its first slice; existing code reuses
   what works and plans the gap. Done when every in-scope criterion and invariant
   belongs to a task, or to existing code with a command that verifies it.

3. **Order.** For each dependency, name the contract it needs and whether agreeing
   on that contract is enough to start. Mark tasks parallel only when their files,
   schema and shared resources do not overlap. Done when every task is labeled
   start now, after a contract or sequential, with the reason.

4. **Builder notes.** For each invariant, write how the builder will hold it:
   transactions, idempotency, retries, ordering. For each external system (payment,
   messaging, email, identity provider), add integration notes: calls made,
   idempotency, webhooks and their order, reconciling when its state drifts from
   ours, and how to test it. Done when every invariant and external system a task
   touches has a note.

5. **Verify.** Give each task a command or exact check, with the failure cases its
   criteria name, and the setup it needs (a test database, environment variables).
   A skipped test verifies nothing. Done when every task has one.

Detail the next slice fully; give later slices a short entry with outcome,
dependencies, builder notes and verify. Link criterion IDs instead of copying
their text. If planning uncovers a product question, record it the decide way and
mark the affected task blocked; answering it may change the journeys and need
re-approval. Stop when the next slice is actionable. Reply with the next work, what
can run in parallel and blockers. Planning ends here: implementing, committing and
dispatching agents wait for the user.
