# Password reset

Decisions: ../decisions.md
Scope: D3, D5–D10, X1
Approved: D11 78c53f1d

## Actors
- person: Signed-out account holder

## Goals
- C1 person: Reset a forgotten password → J1, J2
- C2 person: Get a working link after an old one stopped working → J1, J2
- C3 person: Recover by SMS or security questions → excluded X1

## Invariants
- I1 (D5): THE SYSTEM SHALL NOT reveal whether an email address has an account
- I2 (D6, D7): THE SYSTEM SHALL NOT accept a reset link that is expired, used or replaced
- I3 (D9, D10): THE SYSTEM SHALL NOT keep a password change without also using the link and ending other sessions

## J1: Request a reset link
Actor: person · Exits: confirmation-shown, field-error

Checks:
- denied: n/a — anyone signed out may ask; I1 keeps accounts private
- invalid: J1.S1.c2
- failed: D10
- repeated: J1.S2.c2

### J1.S1 Enter account email (person)
Screen: Forgot password · Sees: email field and "Send link" button
Basis: D3
- c1: WHEN the person submits a well-formed email THE SYSTEM SHALL start a reset request
- c2: IF the email is empty or malformed THE SYSTEM SHALL show a field error
→ J1.S2 when the email is well formed
→ exit field-error when the email is empty or malformed

### J1.S2 Send the link (system)
Basis: D5, D6, D7 · Guards: I1, I2
- c1: WHEN the email belongs to an account THE SYSTEM SHALL email a single-use link that expires in 30 minutes
- c2: WHEN a new link is sent THE SYSTEM SHALL invalidate earlier unused links for that account
- c3: IF the email has no account THE SYSTEM SHALL NOT send anything or reveal that to the requester
→ J1.S3

### J1.S3 See the confirmation (person)
Screen: Forgot password · Sees: "If an account exists, we've emailed a link"
Basis: D5 · Guards: I1
- c1: WHEN a reset is requested THE SYSTEM SHALL show the same confirmation for every well-formed email
- c2: IF the email has no account THE SYSTEM SHALL NOT show a different message
→ exit confirmation-shown

## J2: Set a new password
Actor: person · Exits: signed-in, link-unusable, field-error, retryable-error

Checks:
- denied: J2.S1.c2
- invalid: J2.S2.c2
- failed: D10, J2.S3.c3, J2.S3.c4
- repeated: J2.S1.c2

### J2.S1 Open the reset link (person)
Screen: Reset password · Sees: new password form, or "This link no longer works" with "Send a new link"
Basis: D6, D7 · Guards: I2
- c1: WHEN the person opens a usable link THE SYSTEM SHALL show the new password form
- c2: IF the link is expired, used or replaced THE SYSTEM SHALL NOT show the form
- c3: IF the link is unusable THE SYSTEM SHALL offer to send a new link
→ J2.S2 when the link is usable
→ exit link-unusable when the link is expired, used or replaced

### J2.S2 Choose a new password (person)
Screen: Reset password · Sees: password rules and field errors
Basis: D8
- c1: WHEN the person submits a password that meets the sign-up rules THE SYSTEM SHALL accept it
- c2: IF the password breaks a sign-up rule THE SYSTEM SHALL show which rule failed
→ J2.S3 when the password meets the rules
→ exit field-error when the password breaks a rule

### J2.S3 Change the password and sign in (system)
Basis: D6, D9, D10 · Guards: I2, I3
- c1: WHEN the new password is saved THE SYSTEM SHALL mark the link used, sign out other sessions and sign the person in
- c2: IF the link became unusable before saving THE SYSTEM SHALL NOT change the password
- c3: IF saving fails or its result is unknown THE SYSTEM SHALL NOT keep a partial change
- c4: IF saving fails or its result is unknown THE SYSTEM SHALL show a retryable error
→ exit signed-in when the change succeeds
→ exit link-unusable when the link became unusable
→ exit retryable-error when saving fails
