---
name: journeys
description: Map agreed behavior into actor paths, relevant failures, invariants and testable criteria. Use for behavior specification or reconstruction; skip trivial edits and unsettled product discovery.
---

# Journeys

Make agreed behavior buildable with a small authoritative record. Read project
instructions and accepted scope. Preserve existing formats; decide and automated
checks are optional. Read relevant source/reference sections; run checker scripts
without loading their source unless diagnosing them. For code reconstruction, read [existing-project review](references/existing-projects.md).

1. Inventory requested actor goals and recovery entries before drawing paths.
   Mark each mapped, explicitly excluded or unresolved; compare against sources,
   not just the resulting graph. Code describes behavior, not approved policy.
2. Identify the few shared invariants. Cite accepted decisions for policy and
   sourced O observations for current behavior. Ask only when a missing choice
   changes an in-scope outcome and blocks the next slice. Leave engineering
   mechanics to the builder; never invent policy or limits to pass a check.
3. Use [schema](references/schema.md) for `docs/journeys/<feature>.yaml`. Group
   routine clicks into outcome steps. Cite decisions/observations and affected
   invariants; name only real surfaces. Each criterion describes one observable
   behavior in WHEN/IF/WHILE EARS syntax. Share safeguards through references,
   retaining local forbidden-effect criteria on invariant-sensitive steps.
4. Map ordinary paths, applicable failures and recovery. Deepen for consequential
   money, access, irreversible writes or data integrity, or a requested audit.
   Select relevant [branch questions](references/branches.md), not a blanket matrix.
   Every branch exits or reconnects. Unknown applicable handling is not excluded.
5. Walk the slice and dependencies against sources. Separate owner blockers,
   engineering work and unexecuted release checks. Report code conflicts without
   rewriting policy. Keep IDs permanent: changed meaning needs a new ID; wording
   clarification does not. Retire removed IDs and review downstream task/test links.
6. If Bun exists, run the bundled checker per the schema. Otherwise report manual
   review; do not install tools or change package managers. Gates cover the entire
   file; a smaller-slice review must name its IDs and dependencies without claiming
   a whole-file pass. Observations cannot authorize policy readiness.

Keep YAML authoritative; generate Markdown only for useful review or a host check.
Use validate when no generated view is needed. Tasks reference IDs; generated copies
need freshness checks. Avoid duplicated prose, empty sections and routine-click detail.
Reply with the flow/change, material tradeoff and blockers, not the whole document.

Stop when outcomes and safeguards are agreed and no owner choice blocks the slice;
engineering/release work may remain. “Next gap” stays in scope. Preserve deferrals
and exclusions; do not reopen policy without a request or conflicting evidence.
Planning alone does not authorize implementation, dispatch, commits or publishing.
Separate references checked, tests run and assertions reviewed. A linked test or
structural pass is not behavioral proof; keep host testing conventions.
