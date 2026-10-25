# Password reset tasks

Source: [journeys](../journeys/password-reset.md), approved by D11 78c53f1d · Target: local
All paths are proposed; no application exists.

| ID | Outcome | Needs | Parallel | Status |
|---|---|---|---|---|
| T1 | Person can request a reset link | — | Start now | Todo |
| T2 | Person can set a new password and is signed in | T1 token contract | After the contract is agreed | Todo |

## T1 Request a reset link
Covers: J1, I1, I2 (issuing links).
Change: forgot-password page, request endpoint, reset-token store.
Provides: token contract — hashed token, account, expiry, used/replaced state.
Builder notes:
- I1: respond before sending email, so the response and its timing never depend on whether the account exists.
- I2: store only a token hash; replace earlier unused tokens in the same write that issues the new one.
- Email provider: queue the send after commit, keyed by token ID so a retry sends once; a bounce leaves nothing to undo; test with the provider's sandbox.
Verify: `bun test reset-request` (0 skipped), then walk J1 on Forgot password: a known email, an unknown email, a malformed email, and a second request.
Tests:
- J1.S1.c1, J1.S1.c2: reset-request.test.ts › accepts a well-formed email, rejects a malformed one
- J1.S2.c1: reset-request.test.ts › emails a single-use link that expires in 30 minutes
- J1.S2.c2, I2: reset-request.test.ts › a new link invalidates earlier unused links
- J1.S2.c3, J1.S3.c1, J1.S3.c2, I1: reset-request.test.ts › unknown email gets the same response and no email

## T2 Set a new password
Covers: J2, I2 (redeeming links), I3.
Change: reset-password page and submit endpoint; reuse the sign-up password rules.
Needs: T1 token contract.
Builder notes:
- I2/I3: check the token, change the password, mark the token used and end other sessions in one transaction.
- D10: a retry after a lost response finds the token used and shows "This link no longer works", which offers a new link.
Verify: `bun test reset-password` (0 skipped), then walk J2 on Reset password: a usable link, an expired link, a weak password, and a reused link.
Tests:
- J2.S1.c1, J2.S1.c2, J2.S1.c3: reset-password.test.ts › shows the form only for a usable link
- J2.S2.c1, J2.S2.c2: reset-password.test.ts › enforces the sign-up password rules
- J2.S3.c1: reset-password.test.ts › saves, marks the link used, ends other sessions and signs in
- J2.S3.c2, I2: reset-password.test.ts › two concurrent submits with one link change the password once
- J2.S3.c3, J2.S3.c4, I3: reset-password.test.ts › a failed save keeps nothing and shows a retryable error
