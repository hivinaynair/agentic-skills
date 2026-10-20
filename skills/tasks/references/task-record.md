# Compact task record

Use the host's format first. Otherwise keep one Markdown file per feature, with
source paths, the delivery target (for example locally working or deployed pilot)
and the next usable outcome at the top. Do not duplicate the spec or decision log.
No YAML, renderer, database or new tracker is required by this skill.

Use a short index for multiple tasks:

| ID | Outcome | Needs | Status |
|---|---|---|---|
| T1 | Persist an authorized entry | — | Todo |
| T2 | Show the saved entry | T1's read/write contract | Todo |

A task needs only enough detail to execute and review:

## T1 — Observable deliverable

- Source: relative spec link plus stable criterion IDs, or section anchors when
  the spec has no IDs. Qualify IDs by source file when multiple features use J1.
- Change: concrete outcome and relevant paths; mark proposed files explicitly.
- Needs / provides: required inputs and contracts consumed by other tasks. Omit
  when self-contained; name the defining code location rather than copy types.
- Parallel: ready in parallel, after contract agreed, or sequential; explain
  constraints briefly. Name shared schema/migration/resource ownership where needed.
- Verify: focused command and expected behavior, or exact manual check. Include
  relevant denied/failure behavior according to risk, not a generic test matrix.
- Status: Todo, In progress, Blocked (reason), or Done (executed evidence).

These are prompts, not mandatory headings on every task. Combine short fields;
put shared constraints once. Keep large future tasks brief and explicitly marked
as needing breakdown before execution. A contract-only task is an enabling
artifact, not a completed user feature; an integration owner verifies consumers.

Coverage is the union of task source references and existing implementation
references. Use a compact range or list of exact IDs when clear. For larger
backlogs, a small coverage index is useful only if it reveals gaps; do not repeat
criterion text. An existing path that is unverified still needs verification work.
Retired/excluded criteria do not need tasks; cite their source disposition once.

Before handing off, check missing/duplicate IDs, missing dependency targets, cycles,
and whether each claimed parallel group has satisfied prerequisites and compatible
write scopes. Distinct files may still conflict through APIs, schema or shared
services. If two tasks share a file, serialize them or establish concrete exclusive
ownership before calling them parallel. Re-evaluate downstream ordering after a
conflict changes the schedule. A drawing or a clean graph is not proof of safety.

On completion, record concise evidence on the task: relevant command/result or
manual observation, limitations and source revision when useful. Do not paste logs.
Separate completed code from integrated feature verification and deployment/live
checks. A full-product plan must account for all agreed scope; a next-slice plan
must say what remains later, without treating it as excluded or already built.
