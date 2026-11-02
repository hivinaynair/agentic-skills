# Journey format

Contents: [example](#journey-format) · [rules](#rules) · [commands](#commands) ·
[when your project grows](#when-your-project-grows)

One Markdown file per feature. Headings, bullets, `→` lines and `Key:` lines are
structure the checker reads; any other paragraph, or a bullet list outside a step,
is free prose for context.

```markdown
# Invitations

Decisions: ../decisions.md
Scope: D3, D5, D7, D8, X1

Checks:
- failed: D8

## Actors
- admin: Workspace admin

## Goals
- C1 admin: Invite a teammate → J1
- C2 admin: Recover a lost link → J1
- C3 admin: Email the invite → excluded X1
- C4 admin: Bulk invite from CSV → unresolved: no policy yet
- C5 admin: Remove a member → elsewhere: members.md J2

## Invariants
- I1 (D5): Never: a non-admin creates an invite.

## J1: Invite a teammate
Actor: admin · Exits: created, denied
Basis: D5

Checks:
- denied: I1
- invalid: J1.S1.c2
- repeated: n/a — each request creates its own invite

### J1.S1 Submit the invite (person)
Screen: Members › Invite · Sees: email field, "Create link" button
Guards: I1
- c1: When an admin submits a valid email: the invite is created.
- c2: If the email is malformed: a field error shows.
→ J1.S2 when created
→ exit denied when the requester is not an admin

### J1.S2 Show the link (person)
Screen: Members › Invite · Sees: copyable link and its expiry
Basis: D3, D7
- c1: When the invite is created: its link and expiry show.
→ exit created
```

## Rules

- **Header:** `Decisions:` is the decision record's path relative to this file; list
  lines and table rows both work. `Scope:` lists the decisions and questions this spec
  must settle; each accepted decision must be cited somewhere, and `--ready` fails while
  a listed question is open or a listed line is a draft. `Checks:` here are defaults
  every journey inherits. `Requires:` adds outcome checks this spec must answer beyond
  the four defaults. `approve` adds `Approved: D<n> <hash>`; `Retired:` lists removed IDs.
- **Goals:** `→ J1, J2` (mapped), `→ excluded X<n>` (accepted non-goal),
  `→ elsewhere: <spec>` (covered by another spec) or `→ unresolved: reason`.
  Every journey appears in at least one goal.
- **Invariants:** `- I<n> (basis): Never: …` (or `Always: …`).
- **Journeys:** `## J<n>: Title`, then `Actor:` and `Exits:`. A journey `Basis:` applies
  to every step; its `Checks:` override the header's. The first step is the entry;
  name other ways in as prose.
- **Steps:** `### J<n>.S<n> Title (person|system|external)`. Person steps need
  `Screen:` (separate several with `;`); `Sees:` names what changes for the person
  at this step. A step `Basis:` adds decisions to the journey's; a resolved Q counts
  as its answer. Cite only the decisions the step's criteria follow from.
  `Guards:` names the invariants the step must not break; there is no need to restate them.
- **Criteria:** `- c<n>: When <condition>: <behavior>.` or `If <condition>: <behavior>.`
  (`While`, `Always:` and `Never:` also work). One observable behavior each.
- **Branches:** `→ J1.S2` or `→ exit <name>`; with several branches each adds `when …`.
  Every step must be reachable and reach an exit; loops are fine.
- **Observations** (existing code): `## Observations` with
  `- O1: statement. Source: path@revision locator`. Cite them in Basis.
- **IDs are permanent once the spec is first approved.** Then a changed meaning gets a
  new ID and the old one moves to `Retired:`. Before that, renumber freely.
  Ranges such as `D5–D9` or `I1–I4` work in Scope, Basis and Guards.

**Keep it short.** A criterion or invariant is at most 20 words, a `Sees:` at most 12;
the checker warns past that, about cited decisions over 30 words, and about a step
resting on more than six decisions. Say a shared fact once: in the header, the
journey, or an invariant. A long criterion is usually two behaviors: split it, or
move a shared condition to an invariant.
Never drop a condition, number or scope to fit; a precise long line beats a vague
short one.

## Commands

Two commands. `check` reads whatever file it is given: a journeys file, a task plan
or a project index. `approve` stamps the spec once its independent review passes.

```sh
bun <skill-dir>/scripts/journeys.ts check <file>             # draft: structure, links, reachability
bun <skill-dir>/scripts/journeys.ts check <file> --ready     # plus: complete, accepted, approved
bun <skill-dir>/scripts/journeys.ts check <file> --summary   # a plain page to share, in sentences
bun <skill-dir>/scripts/journeys.ts check <file> --review    # each step beside the text it rests on
bun <skill-dir>/scripts/journeys.ts approve <file> D<n>      # stamp owner approval
```

Draft `check` warns about open items; `--ready` fails on them. `--ready` requires
every goal covered, every Basis on accepted decisions, every check answered and a
current approval. The approval hash covers the structure and the text of every
cited decision, so editing prose keeps it valid. A passing check shows the spec is
consistent and approved; tests show the code works.

The same file has two readers. `--review` is for the independent reviewer: every
step beside the full text it rests on. `--summary` is for sharing with the owner or
the team: approval status, what still needs an answer, goals, invariants, and each
journey's steps and criteria with the checks resolved to the text they cite, almost
without IDs. The owner approves decisions, not this page. Keep detail out of the spec rather than hiding it from the summary: mechanics go
in task builder notes, and longer reasoning in linked docs.

`check <file> --impact D<n> [more IDs]` lists, before anything changes, what editing
or superseding those decisions touches: steps resting on them (directly, through the
journey Basis or through an invariant they support), every criterion of those steps,
checks citing them, and the approval that would go stale. A resolved question counts
as citing its answers. Nothing is changed.

`scripts/pre-commit.sh <file> [--ready]` runs `check` on the staged files from a
Git hook. The older commands `tasks`, `project` and `impact` still work.

## When your project grows

One spec needs none of this. With several, keep an index beside them, normally
`docs/journeys/index.md`. It lists every feature, written or planned, with its task
plans, and can add outcome checks to the four defaults:

```markdown
# Shop

Decisions: ../decisions.md
Requires: money

## Checks
- money: What is charged, refunded or owed when this goes wrong?
- privacy: Who else can see this person's data?

## Specs
- [Checkout](checkout.md) · Tasks: ../tasks/checkout.md
- [Returns](returns.md)
- Gift cards — planned
```

An item without a link is a planned feature; any other text is prose, such as
release notes. `Requires:` makes a check required in every listed spec; a spec's own
`Requires:` header adds one only there. A check defined but not required may still be
answered. A spec listed in an `index.md` beside it takes these checks in `check` too.

`check <index>` checks every listed spec and task plan, then what no single file
shows: `elsewhere:` goals that name a missing spec or journey, journeys files the
index does not list, and accepted decisions no spec cites (framing lines and
approvals are exempt). It prints one row per spec: state, approval, open questions
and task progress. `--ready` also fails on planned features and unready specs;
`--json` prints the same for CI. `check <index> --impact D<n>` covers every spec and
the tasks and tests that own the affected rules.
