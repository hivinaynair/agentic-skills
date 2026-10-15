# Invitation skill trial

The accepted authorization, matching-email, 48-hour expiration, revocation, repeat acceptance, shareable link, and atomic membership rules are recorded. This is a synthetic planning exercise; no application code, commits, or behavior tests were performed.

The initial pass recorded only Q1: which role should acceptance grant? Recommend an existing default member role if the project has one. This blocks only the new-membership permissions in J3.S4. The supplied requirements do not establish any existing role name. The highest-value question to ask the owner is: “Should an accepted invite grant the workspace's default member role, or may the inviter choose a role?”

The existing member-can-invite behavior is explicitly an observation and conflicts with D1. It was not copied into accepted policy. No new email delivery, invitation cap, retry timeout, rate limit, or UI was invented.

## Branch walk

- Ordinary: admin creates link; matching verified recipient accepts before expiration; one membership is created (role remains Q1).
- Authorization: signed-out, non-admin, wrong-workspace admin, and a requester demoted before creation/revocation cannot perform that operation. Creator demotion after creation does not invalidate the invitation.
- Identity: unauthenticated, unverified, and mismatched recipient email cannot grant membership. Identity must still hold when the grant occurs.
- Time and revocation: exactly 48 hours is expired. A revoked invite cannot grant membership, including revocation before the atomic grant after an earlier validation pass.
- Duplicates and concurrency: existing members and repeat recipients receive already-member in the accepted cases. Concurrent acceptances must preserve one workspace/account membership. A lost response after successful acceptance can be retried through the repeat path.
- Partial completion: atomic acceptance forbids partial membership creation. Technical transaction/recovery implementation is left to the builder.
- Unspecified surfaces: error wording, invalid-link presentation, cancellation UI, and dependency-failure presentation are not specified. The spine's negative exits denote the forbidden grant, not approved response copy. The initial pass incorrectly treated these unspecified cases as outside scope; the revised review marks applicable missing behavior open. Existing email normalization and deleted-workspace behavior must be inspected when integrating into an actual application; there is no synthetic implementation evidence to assert either.

## Usability

Both skills were read with their referenced record format, schema, and branch checklist. They were usable without a framework or package-manager assumption and preserved already accepted requirements. The stable-ID tables made the missing role distinguishable from implementation choices. The schema permits the affected step to cite Q1 while independent steps retain accepted sources.

The branch checklist helped expose demotion races, acceptance races, and late revocation beyond a happy-path invitation flow. The parent supplied the new per-journey review schema while this trial was in progress; reviews now record coverage and the open Q1 permission issue. That first review used not-applicable too loosely: unspecified requirements were treated as an implicit scope exclusion. Initial validation caught that review refs must be local to a journey: J2 could not directly cite J3.S4.c3 for the competing acceptance check. The J2 review retains its own revocation criterion; the grant-time criterion is referenced in J3. This locality restriction is a usability limit for cross-journey races.

Initial validation and rendering passed with 21 rules and two expected warnings: unresolved Q1 and the corresponding open permission review. The build-ready check failed on exactly those two blockers. The generated `journeys/invitations.md` was produced by the renderer, not hand edited. This verifies references and structure only; it does not establish behavior, completeness, or production readiness.


## Review refinement

Parent review found a real failure in this trial: the first version hid applicable input, interruption, recovery, and local persistence failure cases behind not-applicable. The skills were tightened to distinguish unknown from impossible or explicitly excluded. Re-reading those instructions changed the result without changing accepted policy or reusing IDs.

Q2 now exposes missing input and unavailable-resource contracts, Q3 repeated/concurrent invitation creation, and Q4 failure and unknown-completion interaction. Existing atomicity and already-member rules cover some safety effects but do not settle all visible recovery outcomes. Email delivery remains explicitly excluded; that does not exclude local database failure. Reviews retain covered references where sufficient and mark partial coverage open where a missing policy still matters.

The spine remains intentionally incomplete for these exception outcomes: the accepted steps and IDs are preserved, and open reviews name what must be answered before new branches can be written. No implementation mechanism, storage library, exact error wording, or arbitrary retry deadline is promoted to owner policy. Q1 is still the first question to ask; the owner has not answered any new question. This refinement shows why a passing structural validator cannot establish semantic completeness.

After refinement, validation and rendering passed with 21 rules and 17 warnings (16 open review entries plus Q1). The ready check failed on those same unresolved entries. The increase reflects visible gaps, not newly invented accepted requirements. No behavior tests were executed.
