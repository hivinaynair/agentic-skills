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
Verify: tests for J1.S1.c1–c2, J1.S2.c1–c3, J1.S3.c1–c2, including an unknown email and a second request.

## T2 Set a new password
Covers: J2, I2 (redeeming links), I3.
Change: reset-password page and submit endpoint; reuse the sign-up password rules.
Needs: T1 token contract.
Builder notes:
- I2/I3: check the token, change the password, mark the token used and end other sessions in one transaction.
- D10: a retry after a lost response finds the token used and shows "This link no longer works", which offers a new link.
Verify: tests for J2.S1.c1–c3, J2.S2.c1–c2, J2.S3.c1–c4, including two concurrent submits with one token.
