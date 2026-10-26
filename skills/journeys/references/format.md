# Journey format

One Markdown file per feature. Headings, bullets, `→` lines and `Key:` lines are
structure the checker reads; any other paragraph is free prose for context.

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
  lines and table rows both work. `Scope:` lists the decisions this spec must cover;
  each accepted one must be cited somewhere. `Checks:` here are defaults every
  journey inherits. `approve` adds `Approved: D<n> <hash>`; `Retired:` lists removed IDs.
- **Goals:** `→ J1, J2` (mapped), `→ excluded X<n>` (accepted non-goal),
  `→ elsewhere: <spec>` (covered by another spec) or `→ unresolved: reason`.
  Every journey appears in at least one goal.
- **Invariants:** `- I<n> (basis): Never: …` (or `Always: …`).
- **Journeys:** `## J<n>: Title`, then `Actor:` and `Exits:`. A journey `Basis:` applies
  to every step; its `Checks:` override the header's. The first step is the entry.
- **Steps:** `### J<n>.S<n> Title (person|system|external)`. Person steps need
  `Screen:` (separate several with `;`); `Sees:` names what the person sees. A step
  `Basis:` adds decisions to the journey's; a resolved Q counts as its answer.
  `Guards:` names the invariants the step must not break; there is no need to restate them.
- **Criteria:** `- c<n>: When <condition>: <behavior>.` or `If <condition>: <behavior>.`
  (`While`, `Always:` and `Never:` also work). One observable behavior each.
- **Branches:** `→ J1.S2` or `→ exit <name>`; with several branches each adds `when …`.
  Every step must be reachable and reach an exit; loops are fine.
- **Observations** (existing code): `## Observations` with
  `- O1: statement. Source: path@revision locator`. Cite them in Basis.
- **IDs are permanent.** A changed meaning gets a new ID; move the old one to `Retired:`.
  Ranges such as `D5–D9` or `I1–I4` work in Scope, Basis and Guards.

**Keep it short.** A criterion or invariant is at most 20 words, a `Sees:` at most 12;
the checker warns past that, and about cited decisions over 30 words. Say a shared
fact once: in the header, the journey, or an invariant.

## Commands

```sh
bun <skill-dir>/scripts/journeys.ts check <file>          # draft: structure, links, reachability
bun <skill-dir>/scripts/journeys.ts check <file> --ready  # plus: complete, accepted, approved
bun <skill-dir>/scripts/journeys.ts check <file> --review # each step beside the text it rests on
bun <skill-dir>/scripts/journeys.ts approve <file> D<n>   # stamp owner approval
```

Draft `check` warns about open items; `--ready` fails on them. `--ready` requires
every goal covered, every Basis on accepted decisions, every check answered and a
current approval. The approval hash covers the structure and the text of every
cited decision, so editing prose keeps it valid. A passing check shows the spec is
consistent and approved; tests show the code works.

`scripts/pre-commit.sh <file> [--ready]` runs `check` on the staged files from a
Git hook.
