---
name: journeys
description: Map an agreed feature into actor journeys, failure branches, invariants and testable acceptance criteria. Use when behavior needs specification or an existing journey changes; skip trivial edits and do not invent unsettled product policy.
---

# Journeys

Describe agreed behavior clearly enough to build and review, with the smallest
maintainable record. Read project instructions and relevant decisions first. An
existing specification is valid input; decide and the optional checker are not
prerequisites. Preserve host formats and use manual review when incompatible.
For code reconstruction, read [existing-project review](references/existing-projects.md).

1. Extract the requested actor goals and recovery entry points before drawing paths.
   Keep a short coverage inventory: mapped, explicitly excluded, or unresolved.
   Compare it with source goals, not just the journeys already drawn. Code reveals
   current behavior, not approval. Preserve settled choices, exclusions and scope.
2. Identify the few shared invariants that matter. Ground policy in accepted
   decisions; use sourced O observations for existing behavior. Missing policy
   remains a question. Ask only when the answer changes an in-scope outcome and
   blocks the next slice; engineering mechanics belong to the builder. Do not
   invent limits or promote recommendations to policy to make checks pass.
3. Use the [schema](references/schema.md) for `docs/journeys/<feature>.yaml`.
   Group routine clicks into meaningful outcome steps. Cite relevant decisions or
   observations and affected invariants; name only real surfaces. Keep each
   criterion to one distinct, observable behavior using WHEN/IF/WHILE EARS syntax.
   Reference shared safeguards; retain a local forbidden-effect criterion where
   an invariant-sensitive step requires one. Do not copy a spec into every path.
4. Default to lightweight depth: ordinary path, applicable failures and recovery.
   Deepen for material money, access, irreversible-write or data-integrity effects,
   or a requested audit. Select applicable [branch questions](references/branches.md),
   not a mandatory matrix. Every branch exits or reconnects; state forbidden effects
   where an invariant could break. Unknown applicable handling is not an exclusion.
5. Walk the selected slice and its dependencies against the sources. Distinguish
   unanswered owner policy, engineering work and unexecuted release checks. Report
   code conflicts without rewriting policy. Q references remain valid in drafts;
   block only affected work. Preserve permanent IDs; retire removed ones. Meaning
   changes need new IDs, wording clarifications do not. Trace affected task and
   verification references when accepted policy changes.
6. If Bun is available, use the bundled `scripts/journeys.ts` per the schema:
   validate checks the source; --coverage checks inventory mappings; --policy-ready
   requires accepted policy; --ready also requires applicable branch reviews.
   The gates check the entire input, not a selected journey. For a smaller slice,
   report a manual review of named IDs and dependencies, not a whole-file pass.
   Observations alone cannot authorize policy readiness. Do not install tools or
   change the host package manager; report manual review when tooling is absent.

Keep the YAML authoritative. Generate Markdown only when useful for review or
required by the host/check command; never hand-maintain a second specification.
Use validate when no generated view is needed. Avoid parallel summaries, empty
sections and repeated history. In replies, show the flow or change, material
tradeoff and blocker rather than reciting the document. Tasks should reference
source IDs; generated copies require freshness checking. No one-task-per-journey rule.

Stop when the slice has agreed outcomes, applicable safeguards and no blocking
owner choice. Engineering and release evidence can remain outstanding. “Next gap”
stays inside scope; exclusions and deferrals are valid completion. Do not expand
inventory from hypothetical risks or reopen settled policy without new evidence.
Planning alone does not authorize implementation, agent dispatch, commits or publishing.

Separate references checked, tests executed and assertions reviewed. A linked test
or structural pass does not prove behavior. Keep the host's testing conventions.
