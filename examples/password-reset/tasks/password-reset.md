# Password reset tasks

Source: [journeys](../journeys/password-reset.md), approved by D11 3f5755cb · Target: local
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
- I1: respond before sending email, so the response never depends on the account existing.
- I2: store only a token hash; replace unused tokens in the same write.
- Email provider: send after commit, keyed by token ID; test in its sandbox.
Verify: `bun test reset-request` (0 skipped).
Walkthrough: J1 on Forgot password with a known, an unknown and a malformed email, then a second request.
Tests:
- reset-request.test.ts
  - J1.S1.c1, J1.S1.c2: accepts well-formed, rejects malformed email
  - J1.S2.c1: emails a single-use 30-minute link
  - J1.S2.c2, I2: a new link invalidates unused ones
  - J1.S2.c3, J1.S3.c1, I1: unknown email: same response, no email

## T2 Set a new password
Covers: J2, I2 (redeeming links), I3.
Change: reset-password page and submit endpoint; reuse the sign-up password rules.
Builder notes:
- I2, I3: check the token, change the password, use the token and end sessions in one transaction.
- D10: a retry after a lost response finds the token used and offers a new link.
Verify: `bun test reset-password` (0 skipped).
Walkthrough: J2 on Reset password with a usable, an expired and a reused link, and a weak password.
Tests:
- reset-password.test.ts
  - J2.S1.c1, J2.S1.c2, J2.S1.c3: form only for a usable link
  - J2.S2.c1, J2.S2.c2: enforces the sign-up password rules
  - J2.S3.c1: saves, uses the link, ends sessions, signs in
  - I2: two concurrent submits change the password once
  - J2.S3.c4, I3: failed save keeps nothing, shows retryable error
