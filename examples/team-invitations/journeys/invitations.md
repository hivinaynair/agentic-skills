# Team invitations

Decisions: ../decisions.md
Scope: D1–D9, X1
Retired: J3.S2.c2, J3.S3.c3, J3.S4.c2, J3.S4.c3, J3.S4.c4

Checks:
- invalid: open — Q2
- failed: open — Q4

Deliberately incomplete fixture: Q1–Q4 are unanswered, so `--ready` must fail.
The brief defines no UI, so every step is a system step.

## Actors
- requester: Person creating or revoking an invitation
- recipient: Person accepting an invitation

## Goals
- C1 requester: Create a shareable invitation → J1
- C2 requester: Revoke an invitation → J2
- C3 recipient: Accept an invitation → J3
- C4 recipient: Retry after losing the acceptance response → J3
- C5 requester: Send the invitation by email → excluded X1

## Invariants
- I1 (D1, D2, D9): Never: create or revoke an invitation for someone not currently an admin of that workspace.
- I2 (D3): Never: grant membership without a matching verified email.
- I3 (D4, D5): Never: grant membership from a revoked invitation or one at least 48 hours old.
- I4 (D6, D8): Never: create a second membership for the same workspace and account.

## J1: Create a shareable invitation
Actor: requester · Exits: created, denied

Checks:
- denied: J1.S1.c2
- repeated: open — Q3

### J1.S1 Authorize and create the invitation (system)
Basis: D1, D4, D9 · Guards: I1
- c1: When a current admin creates an invitation: it expires 48 hours later.
- c2: If the requester is not a current admin: the request is denied.
→ J1.S2 when the requester is a current admin
→ exit denied when the requester is not a current admin

### J1.S2 Return the shareable link (system)
Basis: D7
- c1: When the invitation is created: a shareable acceptance link is returned.
→ exit created

## J2: Revoke an invitation
Actor: requester · Exits: revoked, denied

Checks:
- denied: J2.S1.c2
- repeated: open — Q4 decides what a repeated revocation shows

### J2.S1 Authorize and revoke the invitation (system)
Basis: D2, D5, D9 · Guards: I1
- c1: When a current admin revokes an invitation: it is marked revoked.
- c2: If the requester is not a current admin: the request is denied.
→ exit revoked when the requester is a current admin
→ exit denied when the requester is not a current admin

## J3: Accept an invitation
Actor: recipient · Exits: membership-created, already-member, cannot-grant, identity-not-eligible

Checks:
- denied: J3.S1.c1, J3.S3.c1
- repeated: J3.S2.c1, J3.S4.c5, I4

### J3.S1 Establish recipient identity (system)
Basis: D3 · Guards: I2
- c1: If the verified email does not match the invitation: identity-not-eligible is returned.
→ exit identity-not-eligible when unauthenticated, unverified or the email does not match
→ J3.S2 when the verified email matches

### J3.S2 Recognize repeat acceptance (system)
Basis: D6, D8 · Guards: I4
- c1: When the recipient repeats a completed acceptance: already-member is returned.
→ exit already-member when this recipient already completed acceptance
→ J3.S3 when this recipient has not completed acceptance

### J3.S3 Check the invitation can grant membership (system)
Basis: D4, D5, D6, D9 · Guards: I3, I4
- c1: If the invitation is revoked or expired: cannot-grant is returned.
- c2: When an existing member accepts: already-member is returned.
- c4: When the creator has since been demoted: the invitation keeps its expiry and revocation.
→ exit cannot-grant when the invitation is revoked or expired
→ exit already-member when the account already belongs to the workspace
→ J3.S4 when the invitation is valid and the account is not a member

### J3.S4 Atomically create the membership (system)
Basis: D3, D4, D5, D6, D8, Q1 · Guards: I2, I3, I4
- c1: When an eligible recipient accepts: the membership is created with the role Q1 decides.
- c5: When a concurrent acceptance already created the membership: already-member is returned.
→ exit membership-created when the membership is created
→ exit already-member when another acceptance created it first
→ exit cannot-grant when the invitation became revoked or expired
→ exit identity-not-eligible when the identity is no longer eligible
