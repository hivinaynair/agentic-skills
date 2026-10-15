---
name: journeys
description: Map an agreed feature into actor journeys, failure branches, invariants and testable acceptance criteria. Use when behavior needs specification or an existing journey changes; skip trivial edits and do not invent unsettled product policy.
---

# Journeys

Make the requested feature's behavior explicit enough to implement and review.
No language or runtime is required to use this skill. Read existing project
instructions and decisions first. The decide skill is optional: an existing agreed
specification is a valid input. Preserve its format; use manual reference review if
it is incompatible with the optional checker. For code-based reconstruction or plan
review, also read [existing-project review](references/existing-projects.md).

1. Extract goals, actors and recovery entry points from the request and relevant
   sources. Write the schema’s coverage inventory before detailing journeys. Mark each
   goal mapped, explicitly excluded, or unresolved; do not derive this list only from
   the journeys already drawn. For existing code, distinguish observed entry points
   from approved scope. List journeys before detailing steps. Ask only about unresolved choices; do not
   re-ask what the owner already authorized. Limit scope to the requested feature.
2. Identify the few invariants that must hold across all paths, such as tenant
   isolation or one result per import. Ground proposed policy in accepted decisions;
   ground descriptive rules in source-backed O observations instead of draft D rows. Missing
   policy becomes an open question; do not invent limits to make a rule measurable.
3. Write steps and labeled branches using the [schema](references/schema.md).
   Default output: `docs/journeys/<feature>.yaml`. The adjacent Markdown is generated.
   For each step, reference its decisions and/or observations and the invariants it could break.
   Human, system and external steps need not have a screen; only name real surfaces.
4. Apply the [branch checklist](references/branches.md) where relevant. Every branch
   ends at a named outcome or reconnects to the path. Explicitly state forbidden
   side effects for a step that could break an invariant.
5. Write one behavior per criterion: `WHEN <event> THE SYSTEM SHALL <outcome>`;
   `IF <failure> THE SYSTEM SHALL NOT <forbidden effect>`; or
   `WHILE <state> THE SYSTEM SHALL <behavior>`. These are EARS-style requirements
   (Easy Approach to Requirements Syntax). Use exact states and justified quantities,
   not vague adjectives. Deterministic behavior does not always need a number.
6. Walk the ordinary, incomplete and exception cases. Report conflicts with observed
   code without changing policy. Compare the inventory with source entry points and
   recovery paths, then verify its journey mappings. Keep unresolved decisions visible. A draft can cite
   Q IDs; build-ready validation cannot. Block only the affected scope.
7. Keep IDs permanent. Retain removed step/criterion/invariant IDs in `retired`.
   Changed meaning needs a new ID; wording-only clarification may keep its ID.
   Review downstream tasks and verification links when a decision changes.
8. Use --coverage to check inventory mappings independently of policy approval.
   Observations alone never satisfy --ready. If Bun is available, run the bundled `scripts/journeys.ts` using the commands in
   the schema. Otherwise perform and report manual review; do not claim automated
   checks ran. Do not install tools or change the host's package manager implicitly.

A linked test is not proof of behavior. Separate references checked, tests executed,
and assertions reviewed. Testing conventions belong to the host project: never
rename unrelated tests or require the whole project to adopt this method.
