---
name: tasks
description: Plan implementation from an approved journey spec or other agreed spec, as usable slices with dependencies, safe parallel work, builder notes and a named test for every criterion. Use for new apps or existing code before building; skip trivial edits.
---

# Tasks

You plan how the **builder** delivers an agreed spec: slices a person can use, in a
working order, with a named test proving every criterion. Follow the project's
tracker if it has one; otherwise write `docs/tasks/<feature>.md` in the
[task record](references/task-record.md) format. The checker is the journeys skill's
`journeys/scripts/journeys.ts`, beside this skill's folder.

## Steps

1. **Read.** Read the spec, its decisions and the code it touches, and run
   `journeys.ts check <journeys file> --ready`. If approval is missing or stale, tell
   the owner and plan only what they ask for. Done when you know what exists and
   what is missing.

2. **Slice.** Group criteria into outcomes a person can use end to end, and give
   each criterion and invariant one owning task. Fold foundations into the first
   slice; reuse working code, marking criteria it already meets on this journey's
   path `Built`. Plan the delivery work too: landing the spec and decisions,
   migrations, configuration and the project's own gates. Done when everything in
   scope has an owner.

3. **Order.** Name the contract each dependency needs and whether agreeing on it is
   enough to start. Say when each task starts and, where tasks share files, schema or
   migrations, which merges after which. Put shared schema in one early migration
   where you can, and say which tasks must ship together so nobody meets a dead end.
   Done when every task has a start and a merge order.

4. **Builder notes.** For each invariant, say how the builder holds it: transactions,
   idempotency, retries, ordering. Find the existing constraints, unique indexes and
   validators the new behavior will hit, and put access checks before anything that
   replays or reveals stored state. For each external system the task calls, note
   the calls, idempotency, webhooks, reconciling drift and how to test it. Done when
   every invariant and external system has a note.

5. **Verify.** Under `Tests:`, name the test proving each criterion and invariant the
   task owns: a file and test name, or a manual step. Give each task a command with
   its setup, and end each slice with a `Walkthrough:` of its journeys, including the
   denied, invalid, failed and repeated cases. A skipped test verifies nothing. Done
   when every owned criterion has a named test.

6. **Check.** Stamp the journeys' approval in the Source line and run
   `journeys.ts tasks docs/tasks/<feature>.md` from the repository root. Done when it
   passes. It checks structure, so review the slices, notes and tests yourself.

## Questions and the build

A product choice the spec leaves open (a status, a label, an edge case) becomes a Q
line in the decision record, never a builder note. A `Blocks:` question marks the
tasks that depend on it Blocked (Q<n>); split a task so only those criteria wait. A
`Default` question blocks nothing.

During the build, a task is Done only with `Evidence:`: the command run and its
result, nothing skipped. If a criterion proves wrong or impossible, stop it and raise
a question; never change behavior quietly. `tasks <file> --status` shows each
criterion's task, test and status.

Detail every task that can start now; later ones get a short entry that still names
its tests. Link criterion IDs rather than copying their text. Stop when the next
slice is actionable, and reply with the next work, what runs in parallel and
blockers. Implementing, committing and dispatching agents wait for the user.
