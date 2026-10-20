# Journey schema v1

The optional checker uses Bun 1.4+. The skills themselves do not require it.
Group routine clicks into outcome
steps; keep only distinct behavior criteria. Share safeguards through invariant
references, retaining required local forbidden-effect criteria. Generated Markdown
is a read view, not another source to maintain: generate it for review or `check`,
or use `validate` alone when no rendered view is needed.
Each feature has one authoritative YAML spine. IDs are unique within that file; pair an ID with
its feature path when referencing it outside that feature. Decision IDs belong to
the decision record. The checker accepts explicit paths and does not scan tests.

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

Optional `surface` and `state` strings describe an actual UI/API state. No UI is
required. Every step has a nonempty criteria map and decision or observation references. Criteria
keys are c1, c2, etc. Optional `tasks: [{id: T1, serves: [J1.S1]}]` ties planned work
to steps. Tasks may overlap; implementation ownership is outside this schema.
Do not add tasks merely to make a specification validate.

Every step has exactly one of `next` (nonempty labeled edge list) or `exit` (named
terminal outcome). Each edge has exactly one of `to` or `exit`. All steps must be
reachable from entry and able to reach an exit. Cycles with an exit are valid.
Invariants require accepted policy at the ready gate. A step referencing an invariant
needs at least one unwanted-case `IF ... THE SYSTEM SHALL NOT ...` criterion.

Optional verification map (JSON, path passed explicitly):

```json
{"J1.S1.c1": [{"path": "tests/invitations.test.ts", "locator": "admin can invite"}]}
```

Paths resolve relative to the map. Locators are exact substrings of a test name or
other check identifier; choose a unique one. This checks that a file and locator
exist, not whether the test runs, passes, or asserts the requirement. Python, Go,
manual check documents and other formats can use the same mapping. Map keys are
criterion or invariant IDs, not bare steps. Skipped/dead tests require human review.

From any host project, with `<skill>` the installed journeys folder:

```sh
bun <skill>/scripts/journeys.ts validate docs/journeys/team-invitations.yaml
bun <skill>/scripts/journeys.ts render docs/journeys/team-invitations.yaml
bun <skill>/scripts/journeys.ts check docs/journeys/team-invitations.yaml --ready
bun <skill>/scripts/journeys.ts check docs/journeys/team-invitations.yaml --ready --verification docs/verification.json --require-links
```

`validate` checks structure and references, allowing draft decisions and open questions
with warnings. `render` validates then writes adjacent Markdown, including a Mermaid
flowchart. `check` also requires that Markdown to be fresh. `--policy-ready` rejects
unresolved/draft policy and requires coverage, while
leaving open engineering branch reviews as warnings. `--ready` additionally requires
completed applicable branch reviews. Neither gate proves implementation or release
readiness, and neither executes tests. Both gates cover the whole input file; use a
manual review of named IDs for a smaller slice and its dependencies in a larger
spine. `--require-links` requires a verification entry for
every criterion and invariant, and requires `--verification`. It does not execute tests.
All commands fail on missing inputs; none silently claim success when no spec exists.
Retired IDs are checked against active IDs; detecting deleted history or a changed
meaning under an existing ID still requires diff review.

## Recorded branch review

Each journey may include `review`, required at the `--ready` gate:

```yaml
review:
  permissions:
    status: covered # covered | not-applicable | open
    reason: Non-admin requests end without creating an invite
    refs: [J1.S1.c2]
```

Legacy spines without `review_scope` require entries for `input`, `permissions`,
`interruption`, `dependencies`, `duplicates`, `concurrency`, and `recovery`.
For a lightweight map, explicitly select applicable categories with a reason:

```yaml
review_scope:
  risks: [input, permissions, dependencies]
  reason: Read-only export; authorization and load failures matter, with no durable writes
```

Do not omit a risk merely because its handling is unknown. Select deeper review for
money, access changes and irreversible/data-integrity effects. An empty list needs
a concrete reason too. The checker validates the declaration, not whether risk
selection is sound. Existing review entries outside the selection are still checked
and open entries still block `--ready`; shrinking the list cannot hide them.
Shared safeguards may be referenced by invariant ID in `refs` instead of copying
criteria across journeys. This documents reasoning, not executed implementation.

Covered entries need references to steps or criteria in that journey, or shared
invariants. Not-applicable entries need a concrete reason.
Open entries block `--ready`, but remain warnings under `--policy-ready`. The checker verifies this record's structure and
references, not the truth of the reasoning or completeness of the journey list.
Review the feature's actor goals separately to find missing entire journeys.

A `not-applicable` reason must explain why the risk cannot occur in this slice or
cite an explicit scope exclusion. Silence in the requirements is not an exclusion.
If an open review contains an unanswered product choice, record its Q ID in the
relevant step/invariant's decisions, or an unresolved coverage goal when the path
is not yet mapped. Do not hide unresolved policy in free-text engineering notes;
`--policy-ready` cannot infer policy from a reason string. An engineering-only open
entry should name the remaining action under existing accepted policy. This rule is reviewed by a
person or agent; the checker cannot judge the reasoning from a nonempty string.

## Observations (additive v1 fields)

Observed behavior is evidence, not approval. Store it separately from D/X/Q policy
rows, in the spine. Steps and invariants may cite observations, decisions, or both:

```yaml
observations:
  - id: O1
    statement: The retry handler resets a job before asking the queue to run it
    sources:
      - ref: apps/web/retry.ts
        revision: abc123 # commit, document version, or dated observation
        locator: retryJob, lines 20-35
# On a step or invariant:
# observations: [O1]
# decisions: []
```

`O` IDs are permanent. Each observation requires a statement and at least one source
with `ref`, `revision`, and `locator`. A ref can identify a file, URL, document or test
result. These fields identify the evidence; the checker does not fetch it, verify
source truth or prove it is current. Label deductions and constructed probes in the
statement. A test source should say whether it ran and what it actually asserts.

The `decisions` file path is optional for an observation-only spine. Any D/X/Q reference
still must resolve in the specified decision record. Each step/invariant needs at least
one decision or observation reference. Use `observations: [O1]`, never `decisions: [O1]`.
The renderer labels observation-only steps as descriptive, not approved, even though
criteria keep the common EARS syntax. Observations alone never pass `--ready`:
**every step and invariant still needs accepted policy references**. When policy is
accepted, add D references without changing an observation into a decision. Inspect
whether the decision actually supports the rule; ID resolution cannot prove that.

## Coverage inventory (additive v1 field)

List actor goals and recovery entry points from the request and relevant sources
**before** mapping journeys. Do not generate the inventory just by copying the
journey list: that would preserve the same omissions. Keep it short and scoped.

```yaml
coverage:
  - id: C1
    actor: user
    goal: Retry a failed job
    status: mapped
    journeys: [J1]
  - id: C2
    actor: worker
    goal: Recover work after a dispatch failure
    status: unresolved
    reason: No recovery path or explicit exclusion has been established
  - id: C3
    actor: user
    goal: Send invitations by email
    status: excluded
    reason: Owner limited this feature to shareable links
    decision: X1
```

Actors must exist in `actors`. C IDs are permanent. Every mapped entry requires
existing journey IDs; every journey should appear in the inventory. A reason is
required for unresolved/excluded entries. Excluded entries may cite only active X
scope-exclusion decisions, and coverage/readiness gates require an accepted X.
An absence of code is not an approved scope exclusion. Unresolved entries keep
missing journeys visible; they do not invent a recovery policy.

`--coverage` requires a nonempty inventory, all entries mapped or explicitly excluded,
and every journey mapped. It permits observation-only journeys and still reports
open branch reviews as warnings. Use it during existing-code reviews without claiming
implementation readiness. `--policy-ready` includes coverage plus accepted policy; `--ready` also requires
applicable branch reviews. Draft validation warns on absent/incomplete inventory; malformed entries
and missing mapped journey references always fail.

```sh
bun <skill>/scripts/journeys.ts check docs/journeys/retry.yaml --coverage
# The same --coverage flag works with the pre-commit helper.
```

Retain retired O/C IDs in `retired`, just like retired journey IDs. These checks detect
a journey removed while its inventory reference remains. They cannot detect a goal
missing from both artifacts, a dishonest exclusion, or a semantically wrong mapping.
Review the inventory against source entry points and the user's goals, not just its
syntax. Older v1 spines still validate/render/check without the inventory, with a
warning; they need coverage before passing --ready. No files are migrated implicitly.

For example, stop discovery when creating and accepting an invitation have agreed
outcomes and no blocking owner choice. The builder can still owe transaction and
retry design; email delivery can remain explicitly excluded. Report those facts
without asking the owner to approve database mechanics or adding an email workflow.

```sh
bun <skill>/scripts/journeys.ts check docs/journeys/team-invitations.yaml --policy-ready
```

The pre-commit helper passes this flag through. Use a policy-only gate deliberately;
do not replace an existing engineering or release gate just to remove warnings.
