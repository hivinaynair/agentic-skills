# Team invitations decisions

Synthetic example. Accepted lines stand in for an owner brief dated 2026-10-15;
no real application was inspected.

## Decisions
- D1 accepted — Only current admins of a workspace may create its invitations. Alternative rejected: any member may invite.
- D2 accepted — Only current admins of a workspace may revoke its invitations.
- D3 accepted — The invited email must match the accepting account's authenticated, verified email.
- D4 accepted — Invitations expire 48 hours after creation.
- D5 accepted — Revoked or expired invitations cannot grant membership.
- D6 accepted — An existing member, or a recipient repeating acceptance, gets already-member and no duplicate membership.
- D7 accepted — Creating an invitation returns a shareable link.
- D8 accepted — Acceptance atomically creates at most one membership per workspace and account.
- D9 accepted — Admin permission is checked when creating or revoking; demoting the creator later does not revoke their invitations.
- X1 accepted — Email delivery is out of scope.

## Questions
- Q1 open — Which role does an accepted invitation grant? Recommend: the workspace's default member role. Blocks: J3.S4. Owner: feature owner.
- Q2 open — What does a person see for a malformed address, an unknown link or a deleted workspace? Recommend: reuse the project's existing invalid-input and not-found responses. Blocks: invalid checks in J1–J3.
- Q3 open — Does creating a second invitation for the same email reuse the active one? Recommend: return the active invitation without extending its expiry. Blocks: J1 repeated check.
- Q4 open — Failure default: what does a person see when an action fails or its result is unknown? Recommend: a retryable error; no partial change kept. Blocks: failed checks in J1–J3, J2 repeated check.

## Observations
The brief says any signed-in member can currently invite. This conflicts with D1
and must change. Role names, email comparison, storage and UI are unknown.
