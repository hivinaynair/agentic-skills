---
name: tasks
description: Turn agreed journeys or specifications into a concise implementation backlog with coverage, dependencies, safe parallel work and completion evidence. Use for planning a new application or a feature in an existing codebase; skip trivial edits, unresolved product discovery and executing an already actionable task.
---

# Tasks

Turn agreed behavior into work that delivers connected, usable features. This skill
plans work; it does not implement, dispatch agents, commit or publish. It is usable
without decide, journeys, a particular stack or a task-management service.

1. Read project instructions, accepted scope and the relevant source specification.
   Preserve exclusions and existing task conventions. If a product choice blocks a
   slice, name the affected IDs and ask only the question needed to unblock it;
   continue independent planning. Do not infer approval from code or prototypes.
2. Inspect the relevant implementation and checks before naming existing files.
   For a new app, plan only the foundations the first usable slice needs; label
   proposed paths. For an existing app, trace the affected flow and plan the gap,
   reusing working code and preserving compatibility. Distinguish durable behavior,
   prototype fixtures, source inspection and executed verification. Do not ask the
   owner to select a mode or decide routine engineering mechanics.
3. Group work around usable outcomes, not one task per journey or technical layer.
   Split only where work has a reviewable deliverable, a real dependency or a useful
   independent owner. Fold setup and documentation into the task that needs them.
   Establish shared contracts only where they unblock consumers; avoid a speculative
   foundation phase. A small precise request may need only one task or no new file.
4. Write the [compact task record](references/task-record.md). Default to one
   `docs/tasks/<feature>.md`, preserving an existing tracker. Use stable task IDs;
   link criterion IDs and source paths instead of copying requirements. Detail the
   next usable slice and its prerequisites; keep later work coarse but accounted for.
5. For each dependency, state the concrete contract or artifact required and whether
   agreement on its interface is enough to start. Check shared files, schema,
   migrations and external resources as well as logical dependencies. Mark work
   ready in parallel, after contract agreed, or sequential with a short reason.
   Unchecked overlap is not safe parallelism. Do not dispatch or assign agents.
6. Review coverage against the source, not just the tasks already written. Every
   in-scope criterion and applicable shared invariant needs task ownership, or a
   source-backed existing implementation reference with its verification status.
   Whole-journey references are shorthand only when all its criteria are accounted
   for. Keep missing coverage and blocked work visible; do not exclude it yourself.
7. Include the work needed to connect the slice end to end: UI/API/storage/provider
   handoffs, migrations, configuration and integration checks where applicable to
   the delivery target. Attach a verification command or observable check to each
   deliverable. Unavailable credentials, deployments or physical checks remain
   named blockers to the relevant target, not permission to claim completion.
8. Stop when the next slice has actionable tasks, justified dependencies and clear
   evidence requirements, with remaining scope assigned or visibly blocked. Report
   only the next work, parallel opportunities and material blockers. Do not reopen
   settled product policy, recursively expand the backlog or prescribe every edit.

Keep one authoritative home per fact. Omit empty sections and repeated history;
expand only to resolve a concrete ambiguity. Summarize changes, not the entire plan.
When scope or a contract changes, update affected tasks and coverage, preserve IDs
and completion evidence, and recheck parallel groups; do not regenerate the backlog
or silently rewrite accepted requirements.

Task checkboxes are tracking, not proof. Feature completion requires verification
of the integrated source behavior at the agreed target. On resume, verify recorded
status against current code/evidence before scheduling dependent work. Mechanical
ID/dependency checks cannot prove correct implementation or safe parallelism.
