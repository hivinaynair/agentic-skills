# Password reset

Decisions: ../decisions.md
Approved: D11 3f5755cb
Scope: D3, D5–D10, X1
Retired: J1.S3.c2, J2.S3.c2, J2.S3.c3

Checks:
- failed: D10

## Actors
- person: Signed-out account holder

## Goals
- C1 person: Reset a forgotten password → J1, J2
- C2 person: Get a working link after an old one stopped working → J1, J2
- C3 person: Recover by SMS or security questions → excluded X1

## Invariants
- I1 (D5): Never: reveal whether an email address has an account.
- I2 (D6, D7): Never: accept a reset link that is expired, used or replaced.
- I3 (D9, D10): Never: keep a password change without using the link and ending other sessions.

## J1: Request a reset link
Actor: person · Exits: confirmation-shown, field-error
Basis: D3, D5

Checks:
- denied: n/a — anyone signed out may ask; I1 keeps accounts private
- invalid: J1.S1.c2
- repeated: J1.S2.c2

### J1.S1 Enter account email (person)
Screen: Forgot password · Sees: email field and "Send link" button
- c1: When a well-formed email is submitted: a reset request starts.
- c2: If the email is empty or malformed: a field error shows.
→ J1.S2 when the email is well formed
→ exit field-error when the email is empty or malformed

### J1.S2 Send the link (system)
Basis: D6, D7 · Guards: I1, I2
- c1: When the email has an account: a single-use link valid for 30 minutes is emailed.
- c2: When a new link is sent: earlier unused links for that account stop working.
- c3: If the email has no account: nothing is sent.
→ J1.S3

### J1.S3 See the confirmation (person)
Screen: Forgot password · Sees: "If an account exists, we've emailed a link"
Guards: I1
- c1: When a reset is requested: the same confirmation shows for every well-formed email.
→ exit confirmation-shown

## J2: Set a new password
Actor: person · Exits: signed-in, link-unusable, field-error, retryable-error
Basis: D6

Checks:
- denied: J2.S1.c2
- invalid: J2.S2.c2
- repeated: J2.S1.c2

### J2.S1 Open the reset link (person)
Screen: Reset password · Sees: password form, or "This link no longer works"
Basis: D7 · Guards: I2
- c1: When a usable link is opened: the new password form shows.
- c2: If the link is expired, used or replaced: the form does not show.
- c3: If the link is unusable: an offer to send a new link shows.
→ J2.S2 when the link is usable
→ exit link-unusable when the link is expired, used or replaced

### J2.S2 Choose a new password (person)
Screen: Reset password · Sees: password rules and field errors
Basis: D8
- c1: When the password meets the sign-up rules: it is accepted.
- c2: If the password breaks a sign-up rule: the failed rule is named.
→ J2.S3 when the password meets the rules
→ exit field-error when the password breaks a rule

### J2.S3 Change the password and sign in (system)
Basis: D9, D10 · Guards: I2, I3
- c1: When the password is saved: the link is used, other sessions end and the person is signed in.
- c4: If saving fails or its result is unknown: a retryable error shows.
→ exit signed-in when the change succeeds
→ exit link-unusable when the link became unusable before saving
→ exit retryable-error when saving fails
