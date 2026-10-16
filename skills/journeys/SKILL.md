---
name: journeys
description: Map agreed requirements or existing behavior into actor paths, failure branches and testable criteria. Use to specify or review a feature's journeys; skip trivial edits and do not invent product policy.
---

# Journeys

Input: agreed requirements or code to review; decide is optional. Output:
`docs/journeys/<feature>.yaml` and generated adjacent Markdown. Respect project
instructions and formats; incompatible formats require manual review or an
explicit migration, not silent conversion.

1. Inventory actors, goals and recovery entry points from the request and sources
   **before** detailing journeys. Mark goals mapped, excluded or unresolved;
   map only represented behavior; leave unknown goals unresolved. Exclusions need
   accepted scope policy. Do not derive coverage only from the
   graph already drawn. Keep scope bounded; reuse settled answers.
2. Read the [schema](references/schema.md) when writing the spine. Identify the few
   cross-path invariants. Ground behavior in accepted decisions, source-backed O
   observations, or open Q references for drafts; never manufacture draft decisions
   from code. Keep gaps as Qs/open coverage/reviews, never placeholder behavior;
   block only affected paths.
3. List journeys, then steps and labeled branches. Steps cite their policy/evidence
   and invariants they could break. Human, system and external steps need a surface
   only when one exists. Every branch reaches an outcome or reconnects.
4. Apply the [branch review](references/branches.md). For existing-code or plan/code
   comparison, also read [existing-project review](references/existing-projects.md).
   Write one observable behavior per EARS-style criterion (Easy Approach to
   Requirements Syntax): `WHEN … THE SYSTEM SHALL …`, `WHILE … THE SYSTEM SHALL …`,
   or `IF … THE SYSTEM SHALL NOT …`. State forbidden effects for invariant risks;
   use precise states and justified quantities, not invented limits or vague timing.
5. Walk normal, incomplete and exception cases; compare inventory against source
   goals/recovery paths and verify mappings. Report code/policy conflicts without
   changing policy. Keep IDs permanent; retain removals in `retired`. Changed meaning
   needs a new ID; wording fixes may keep it. Review downstream links after changes.
6. With Bun, run the schema's bundled validate/render/check commands. `--coverage`
   checks inventory independently; `--ready` also requires approved policy and branch
   reviews. Observations alone cannot pass readiness. Without Bun, report manual
   review; never claim automated checks ran or install tools implicitly.

Separate reference checks, executed tests and assertion review. A linked test is
not behavior proof. Preserve host testing conventions; do not rename unrelated tests.
