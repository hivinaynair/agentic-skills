# Journey schema v1

Optional tooling: Bun 1.4+. The skills need no runtime. One spine per feature;
IDs are local except D/X/Q IDs, which belong to its decision record. Outside a
spine, pair IDs with its path. The checker accepts explicit paths; it does not scan tests.

```yaml
version: 1
feature: team-invitations
decisions: ../decisions.md # relative to this YAML file
retired: [] # removed journey, step, criterion or invariant IDs; never reuse
actors:
  - id: admin
    name: Workspace administrator
invariants:
  - id: I1
    rule: THE SYSTEM SHALL NOT let non-admins create invitations
    decisions: [D1]
journeys:
  - id: J1
    title: Invite a teammate
    actor: admin
    entry: J1.S1
    exits: [created, denied]
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

## Structure and IDs

Every step has nonempty criteria keyed `c1`, `c2`, etc., a decision/observation basis, and
exactly one terminal `exit` or nonempty `next`. Edges have a label and exactly one
`to` or `exit`. Steps must be reachable from entry and able to reach an exit;
cycles with exits are valid. Optional `surface`/`state` describe real interfaces;
state requires a surface. Empty `invariants: []` is allowed.

Steps referencing an invariant need an `IF … THE SYSTEM SHALL NOT …` criterion.
Invariants use `id`, `rule` and a decision/observation basis. Optional
`tasks: [{id: T1, serves: [J1.S1]}]` links planned work to steps; ownership may overlap.
Do not invent tasks for validation.

IDs are permanent: J journeys, J.S steps, J.S.c criteria, I invariants, O observations,
C coverage. Retain removed IDs in `retired`; never reuse them. Detecting deleted
history or changed meaning under an unchanged ID requires diff review.

## Observations

Descriptive evidence stays separate from approved policy:

```yaml
observations:
  - id: O1
    statement: The handler resets a job before submitting it to the queue
    sources:
      - {ref: src/retry.ts, revision: abc123, locator: retryJob}
# Step/invariant basis: observations: [O1], decisions: []
```

Each O requires a statement and nonempty sources with `ref`, `revision` and `locator`.
Sources may identify files, URLs, documents or tests; revisions can be commits,
versions or dates. Metadata is required, but its truth/currency is not checked.
Label deductions, constructed probes and what test evidence actually executed.

Steps/invariants need nonempty decisions, observations, or both. Put O IDs under
`observations`, never `decisions`. Observation-only spines may omit the `decisions`
file path; D/X/Q references still need its record. Drafts may cite Q; readiness
requires accepted D/X references on **every step and invariant**. When approved,
add policy references; never relabel observations to pass. Review whether the
referenced policy actually supports each rule.

## Coverage inventory

Build goals from actors and source entry/recovery points before mapping the graph.

```yaml
coverage:
  - {id: C1, actor: admin, goal: Invite a teammate, status: mapped, journeys: [J1]}
  - id: C2
    actor: admin
    goal: Recover after an interrupted request
    status: unresolved
    reason: Recovery behavior has not been agreed
  - id: C3
    actor: admin
    goal: Send invitation emails
    status: excluded
    reason: Owner chose shareable links only
    decision: X1
```

Actors must exist. `mapped` requires existing journey IDs; every journey needs a
mapping. `unresolved`/`excluded` require reasons. Exclusions may cite only active
X decisions; coverage/readiness require accepted X. Absent code is not an exclusion.
Removing a journey while retaining its mapping always fails. A goal omitted from
both inventory and graph, a dishonest exclusion or an insufficient mapping still
requires source/diff review.

## Branch review

Each journey needs all seven review entries for readiness: `input`, `permissions`,
`interruption`, `dependencies`, `duplicates`, `concurrency`, `recovery`.

```yaml
review:
  permissions:
    status: covered # covered | not-applicable | open
    reason: Non-admin requests cannot create invitations
    refs: [J1.S1.c2]
```

`covered` needs references to that journey's steps/criteria. `not-applicable` needs
a concrete reason establishing impossibility or accepted exclusion. `open` blocks
readiness and can name a Q in its reason. Syntax/reference checks do not assess
the reasoning; apply the [branch checklist](branches.md).

## Commands and gates

With `<skill>` replaced by the installed journeys folder:

```sh
bun <skill>/scripts/journeys.ts validate docs/journeys/feature.yaml
bun <skill>/scripts/journeys.ts render docs/journeys/feature.yaml
bun <skill>/scripts/journeys.ts check docs/journeys/feature.yaml --coverage
bun <skill>/scripts/journeys.ts check docs/journeys/feature.yaml --ready
```

- `validate`: structure and references; unresolved policy/reviews warn in draft.
- `render`: validate, then generate adjacent Markdown with tables/flowcharts.
- `check`: also require current generated Markdown.
- `--coverage`: require a nonempty inventory, no unresolved goals, accepted
  exclusions and every journey mapped. Observed behavior is permitted.
- `--ready`: coverage plus accepted policy and completed branch reviews.

Missing inputs fail. Old v1 spines without inventory remain valid drafts with a
warning, but cannot pass either gate. Malformed entries and missing mapped journeys
always fail. No implicit migration occurs. The pre-commit helper accepts the same
flags; these commands never execute product tests.

## Optional verification links

```json
{"J1.S1.c1": [{"path": "tests/invitations.test.ts", "locator": "admin can invite"}]}
```

Pass `--verification docs/verification.json` to check file and locator existence;
add `--require-links` to require links for every criterion/invariant. Keys are rule
IDs, not steps. Paths resolve relative to the map; locators are exact substrings of
a test/check identifier, preferably unique. This is language-independent and may
reference manual checks. Linked, skipped or dead tests still require execution
and assertion review; links prove neither.
