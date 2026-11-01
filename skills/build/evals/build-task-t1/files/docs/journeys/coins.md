# Coins earning

Decisions: ../decisions.md
Approved: D11 67ef2086
Scope: D4–D9, X1

Checks:
- failed: D9

## Actors
- customer: Signed-in customer
- system: Store backend

## Goals
- C1 customer: Earn coins on an order → J1
- C2 customer: See the coin balance and where it came from → J2
- C3 customer: Spend coins at checkout → excluded X1

## Invariants
- I1 (D5, D9): Never: coins credited twice for one order.
- I2 (D6): Never: coins credited for an order returned or refunded in its window.

## J1: Earn coins on an order
Actor: system · Exits: credited, not-credited
Basis: D5

Checks:
- denied: J1.S1.c2
- invalid: J1.S1.c3
- repeated: I1

### J1.S1 Check the closed order (system)
Basis: D6, D7
Guards: I2
- c1: When an order's return window closes unreturned: it is ready to credit.
- c2: If the order was a guest order: no coins are credited.
- c3: If the order was returned or refunded in the window: no coins are credited.
→ J1.S2 when ready to credit
→ exit not-credited when guest, returned or refunded

### J1.S2 Credit the coins (system)
Basis: D4
Guards: I1
- c1: When the order is credited: coins equal the amount paid excluding shipping, rounded down.
- c2: When crediting runs again for the same order: no further coins are added.
→ exit credited

## J2: See the balance
Actor: customer · Exits: shown
Basis: D8

Checks:
- denied: J2.S1.c2
- invalid: n/a — the page takes no input
- repeated: n/a — viewing changes nothing

### J2.S1 Open the account page (person)
Screen: Account · Sees: coin balance and a list of credits
- c1: When the account page opens: the balance and each credit with its order number show.
- c2: If the customer is not signed in: the sign-in page shows instead.
→ exit shown
