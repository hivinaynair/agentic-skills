# Coin display

Decisions: ../decisions.md
Approved: D4 0c466edc
Scope: D1, D2

Checks:
- denied: n/a — formatting reveals nothing beyond the screen it is on
- invalid: n/a — amounts come from the ledger, never typed
- failed: n/a — formatting cannot fail
- repeated: n/a — formatting changes nothing

## Actors
- customer: Signed-in customer

## Goals
- C1 customer: Read a coin amount at a glance → J1

## J1: Read a coin amount
Actor: customer · Exits: shown

### J1.S1 See an amount (person)
Screen: Account · Sees: coin balance written out in words and digits
Basis: D1, D2
- c1: When an amount is shown: it has a comma every three digits.
- c2: When the amount is exactly one: it reads "1 coin"; otherwise "coins".
→ exit shown
