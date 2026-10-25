# Password reset decisions

Synthetic example. Every accepted line stands in for an owner answer given on
2026-10-25; no real application was inspected.

## Frame
- D1 accepted — Problem: people who forget their password cannot get back in without contacting support.
- D2 accepted — Primary user: a signed-out account holder who can read their account email.
- D3 accepted — First usable outcome: the person requests a link, sets a new password and is signed in.
- D4 accepted — Success signal: lockout support requests fall within a month of launch.
- X1 accepted — Recovery by SMS or security questions is out of scope.

## Decisions
- D5 accepted — The request page shows the same confirmation whether or not the email has an account. Why: do not reveal who has an account.
- D6 accepted — A reset link works once and expires 30 minutes after it is sent.
- D7 accepted — Requesting a new link invalidates earlier unused links.
- D8 accepted — A new password must meet the existing sign-up password rules.
- D9 accepted — A successful reset signs out every other session and signs the person in.
- D10 accepted — Failure default: when an action fails or its result is unknown, the person sees a retryable error and no partial change is kept.
- D11 accepted — Approved for build: password-reset J1–J2.
