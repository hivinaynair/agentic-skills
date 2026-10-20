# Compact task record

Use the host's tracker. Otherwise keep one Markdown file per feature with source
paths, delivery target (local/deployed/pilot) and next usable outcome. No new YAML,
renderer, database or task service is required. For multiple tasks, a short index:

| ID | Outcome | Needs | Status |
|---|---|---|---|
| T1 | Persist an authorized entry | — | Todo |
| T2 | Show the saved entry | T1's read/write contract | Todo |

Each task contains only what execution/review needs; combine fields and omit empty ones:

- Source: linked criterion IDs or spec anchors, qualified by feature path.
- Change: outcome and relevant paths; label proposed files.
- Needs/provides: consumed/produced contracts, linked to their defining code.
- Parallel: ready in parallel, after contract agreed or sequential, with constraints.
- Verify: command/expected result or exact manual check, with risk-appropriate failures.
- Status: Todo, In progress, Blocked (reason), Done (executed evidence).

Share constraints once. Keep future work coarse and marked for breakdown before
execution. Contract-only delivery enables consumers; an integration owner verifies
the resulting feature. Record concise results/limitations, not logs. Separate code,
integration and deployment/live evidence.

Coverage combines task references and existing implementation references. Unverified
existing code still needs verification work. Compare accepted decisions and delivery
requirements with journeys; cite specification/ownership gaps without inventing
criteria. Excluded/retired criteria need no task; cite their disposition once. A
small coverage index is useful only if it reveals gaps; do not copy requirement text.

Check missing/duplicate IDs, missing dependencies, cycles and parallel ownership.
Different files can conflict through contracts, schema or services. Shared-file
writers serialize unless exclusive ownership is established. Recheck downstream
ordering after a conflict changes scheduling; a clean graph cannot prove safety.

For active backlogs, identify owners, in-flight work and the evidence checkpoint.
A review proposes groups; an authorized paused migration preserves IDs, assignments
and completed evidence, adding only needed splits and updating affected links.
Validator changes are separate authorized work, not permission to ignore failing
gates. A whole-product plan accounts for all agreed scope; a slice plan names later
work without implying exclusion or completion.
