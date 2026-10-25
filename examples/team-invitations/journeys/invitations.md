# Team invitations

Decisions: ../decisions.md
Scope: D1–D9, X1

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
- I1 (D1, D2, D9): THE SYSTEM SHALL NOT create or revoke an invitation for a requester who is not currently an admin of that workspace
- I2 (D3): THE SYSTEM SHALL NOT grant membership without a matching authenticated verified email
- I3 (D4, D5): THE SYSTEM SHALL NOT grant membership from an invitation that is revoked or at least 48 hours old
- I4 (D6, D8): THE SYSTEM SHALL NOT create more than one membership per workspace and account

## J1: Create a shareable invitation
Actor: requester · Exits: created, denied

Checks:
- denied: J1.S1.c2
- invalid: open — Q2
- failed: open — Q4
- repeated: open — Q3

### J1.S1 Authorize and create the invitation (system)
Basis: D1, D4, D9 · Guards: I1
- c1: WHEN a current workspace admin creates an invitation THE SYSTEM SHALL set it to expire 48 hours after creation
- c2: IF the requester is not an admin of the workspace at creation time THE SYSTEM SHALL NOT create the invitation
→ J1.S2 when the requester is a current admin
→ exit denied when the requester is not a current admin

### J1.S2 Return the shareable link (system)
Basis: D7
- c1: WHEN the invitation is created THE SYSTEM SHALL return a shareable acceptance link
→ exit created

## J2: Revoke an invitation
Actor: requester · Exits: revoked, denied

Checks:
- denied: J2.S1.c2
- invalid: open — Q2
- failed: open — Q4
- repeated: open — Q4 decides what a repeated revocation shows

### J2.S1 Authorize and revoke the invitation (system)
Basis: D2, D5, D9 · Guards: I1
- c1: WHEN a current admin revokes an invitation for that workspace THE SYSTEM SHALL mark it revoked
- c2: IF the requester is not an admin of the invitation's workspace at revocation time THE SYSTEM SHALL NOT revoke it
→ exit revoked when the requester is a current admin
→ exit denied when the requester is not a current admin

## J3: Accept an invitation
Actor: recipient · Exits: membership-created, already-member, cannot-grant, identity-not-eligible

Checks:
- denied: J3.S1.c1, J3.S3.c1
- invalid: open — Q2
- failed: open — Q4
- repeated: J3.S2.c1, J3.S2.c2, J3.S4.c5

### J3.S1 Establish recipient identity (system)
Basis: D3 · Guards: I2
- c1: IF the accepting account lacks an authenticated verified email matching the invitation THE SYSTEM SHALL NOT grant membership
→ exit identity-not-eligible when unauthenticated, unverified or the email does not match
→ J3.S2 when the verified email matches

### J3.S2 Recognize repeat acceptance (system)
Basis: D6, D8 · Guards: I4
- c1: WHEN the same recipient repeats a completed acceptance THE SYSTEM SHALL return already-member
- c2: IF the recipient already has a membership THE SYSTEM SHALL NOT create a duplicate membership
→ exit already-member when this recipient already completed acceptance
→ J3.S3 when this recipient has not completed acceptance

### J3.S3 Check the invitation can grant membership (system)
Basis: D4, D5, D6, D9 · Guards: I3, I4
- c1: IF the invitation is revoked or at least 48 hours old THE SYSTEM SHALL NOT grant membership
- c2: WHEN an existing member accepts a valid invitation THE SYSTEM SHALL return already-member
- c3: IF the accepting account already belongs to the workspace THE SYSTEM SHALL NOT create a duplicate membership
- c4: WHEN the invitation's creator has since been demoted THE SYSTEM SHALL keep the invitation's expiry and revocation state
→ exit cannot-grant when the invitation is revoked or expired
→ exit already-member when the account already belongs to the workspace
→ J3.S4 when the invitation is valid and the account is not a member

### J3.S4 Atomically create the membership (system)
Basis: D3, D4, D5, D6, D8, Q1 · Guards: I2, I3, I4
- c1: WHEN an eligible recipient accepts a valid invitation THE SYSTEM SHALL create the membership with the role decided by Q1
- c2: IF acceptances for the same workspace and account run concurrently THE SYSTEM SHALL NOT create more than one membership
- c3: IF the invitation is revoked or expired when membership would be granted THE SYSTEM SHALL NOT grant membership
- c4: IF the accepting account no longer has the matching verified email when membership would be granted THE SYSTEM SHALL NOT grant membership
- c5: WHEN a concurrent acceptance already created this membership THE SYSTEM SHALL return already-member
→ exit membership-created when the membership is created
→ exit already-member when another acceptance created it first
→ exit cannot-grant when the invitation became revoked or expired
→ exit identity-not-eligible when the identity is no longer eligible
