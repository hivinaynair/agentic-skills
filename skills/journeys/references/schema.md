# Journey schema v1

Optional checker: Bun 1.4+, no dependencies. One authoritative YAML spine per
feature. IDs are file-local; qualify references across features. Decisions belong
to the linked record. Preserve IDs; review diffs for changed meaning/deleted history.

```yaml
version: 1
feature: team-invitations
decisions: ../decisions.md # relative to this file
retired: [] # removed I/O/C/J/step/criterion IDs; never reuse
actors:
  - { id: admin, name: Workspace administrator }
invariants:
  - id: I1
    rule: THE SYSTEM SHALL NOT let non-admins create invitations
    decisions: [D1]
coverage:
  - id: C1
    actor: admin
    goal: Create a shareable invitation
    status: mapped
    journeys: [J1]
journeys:
  - id: J1
    title: Invite a teammate
    actor: admin
    entry: J1.S1
    exits: [created, denied]
    review_scope:
      risks: [permissions]
      reason: Minimal authorization example; review other effects in a real implementation
    review:
      permissions:
        status: covered
        reason: Non-admin requests cannot create invitations
        refs: [J1.S1.c2]
    steps:
      - id: J1.S1
        title: Request an invitation
        kind: system # human | system | external
        decisions: [D1]
        invariants: [I1]
        criteria:
          c1: WHEN an admin submits a valid invitation THE SYSTEM SHALL create it
          c2: IF the requester is not an admin THE SYSTEM SHALL NOT create an invitation
        next:
          - { to: J1.S2, when: authorized }
          - { exit: denied, when: unauthorized }
      - id: J1.S2
        title: Return the invitation
        kind: system
        decisions: [D1]
        invariants: []
        criteria:
          c1: WHEN an invitation is created THE SYSTEM SHALL return its identifier
        exit: created
```

Group clicks into outcome steps; keep distinct observable criteria and shared
invariants. Every step needs a nonempty criteria map (c1, c2…) and decision or
observation references. Optional surface/state describe real UI/API states; state
needs surface, but no screen is required. Invariant-sensitive steps need a local
`IF ... THE SYSTEM SHALL NOT ...` criterion. Empty invariant lists are allowed.

Each step has exactly one next (nonempty labeled edges) or exit (named outcome).
Each edge has when and exactly one to/exit. All steps must be reachable and able
to reach an exit; cycles with exits are valid. Optional tasks:
`[{id: T1, serves: [J1.S1]}]`. Tasks can overlap/span journeys; do not add them to
make validation green. Implementation ownership is outside the journey checker.

## Branch reviews

Review statuses: covered, not-applicable, open; all need a reason. Covered needs
refs to local steps/criteria or shared invariants. Not-applicable needs a concrete
impossibility or accepted exclusion; unspecified behavior is not excluded.

Without review_scope, --ready requires all seven categories: input, permissions,
interruption, dependencies, duplicates, concurrency, recovery. For lightweight maps,
review_scope selects unique applicable categories with a reason (even an empty list
needs one). Existing reviews outside the selection remain checked; shrinking scope
cannot hide open reviews. Selection quality still requires human/agent judgment.

Open engineering reviews block --ready, not --policy-ready. Put unanswered product
Q IDs on the relevant step/invariant, or an unresolved inventory goal for an unmapped
path; never hide policy in free-text engineering notes. The checker cannot infer it.

## Observations

O IDs describe evidence, not approved policy:

```yaml
observations:
  - id: O1
    statement: The retry handler resets the job before dispatching it
    sources:
      - { ref: apps/retry.ts, revision: abc123, locator: "retryJob, lines 20-35" }
# On a step/invariant:
# observations: [O1]
# decisions: []
```

Each O needs a statement and sources with ref/revision/locator. Label deductions,
synthetic probes and what tests actually exercised. Sources are not fetched or
verified by the checker. Observation-only spines may omit decisions; D/X/Q refs
still need a decision file. Use observations for O IDs, never decisions. Each
step/invariant needs at least one basis reference. Both readiness gates require
accepted policy on every step/invariant; add D refs without relabeling observations.
ID resolution alone cannot prove that a decision supports a requirement.

## Coverage inventory

Derive actor goals/recovery entries from sources before drawing paths; copying the
journey list cannot expose omitted goals. C IDs have actor, goal and status:

- mapped: nonempty journeys referencing existing journey IDs.
- excluded: reason and an active accepted X decision in decision for coverage/readiness.
- unresolved: reason; blocks coverage/readiness without inventing recovery policy.

Every journey must be mapped. Only mapped entries may name journeys, only excluded
entries may name decision. Retire removed C/O IDs like other IDs. No code is not an
approved exclusion. Review mappings against sources; the checker cannot detect a
goal omitted from both artifacts or judge semantic coverage. Old spines without an
inventory still validate with a warning; coverage/readiness requires it. No migration
is implicit.

## Commands and evidence

```sh
bun <skill>/scripts/journeys.ts validate docs/journeys/feature.yaml
bun <skill>/scripts/journeys.ts render docs/journeys/feature.yaml
bun <skill>/scripts/journeys.ts check docs/journeys/feature.yaml --coverage
bun <skill>/scripts/journeys.ts check docs/journeys/feature.yaml --policy-ready
bun <skill>/scripts/journeys.ts check docs/journeys/feature.yaml --ready
```

validate checks structure/references, warning on draft policy. render writes adjacent
Markdown; check also requires it fresh. Use validate alone when no read view is needed.
--coverage requires mapped/excluded goals and every journey mapped, permitting
observations. --policy-ready adds accepted policy; --ready adds applicable branch
reviews. Neither proves working code or release readiness. Gates cover the whole
file; report a manual named-slice review for smaller scope. Do not weaken existing
engineering/release gates to silence warnings. The staged hook passes these flags
through. Warning output is capped by default; --verbose prints all warnings.

Optional verification JSON, passed with --verification:

```json
{"J1.S1.c1": [{"path": "tests/invitations.test.ts", "locator": "admin can invite"}]}
```

Paths are relative to the map. Keys are criterion/invariant IDs, not steps. Exact
locator substrings must exist in the file; choose unique identifiers. --require-links
requires a map and links for every criterion/invariant. These checks do not execute
tests or judge assertions/skipped tests; manual-check documents are also valid.
Missing inputs fail. Distinguish references checked, tests executed and assertions
reviewed. A clean graph, fresh Markdown or present locator is not correctness proof.
