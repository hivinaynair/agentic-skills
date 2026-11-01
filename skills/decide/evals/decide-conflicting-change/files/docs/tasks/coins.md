# Coins earning tasks

Source: [journeys](../journeys/coins.md), approved by D11 67ef2086 · Target: local

| ID | Outcome | Needs | Parallel | Status |
|---|---|---|---|---|
| T1 | Closed orders earn the right coins exactly once | — | Start now | Todo |
| T2 | Customer sees balance and credits | T1 | After T1 | Todo |

## T1 Credit coins for closed orders
Covers: J1, I1, I2.
Change: `src/coins.ts`: `creditClosedOrder(ledger, order)` returns the coins credited.
Builder notes:
- I1: the ledger keeps one credit per order ID; a second call for that order adds nothing.
- D4: amounts are in whole currency units; shipping is excluded before rounding down.
Verify: `bun test src` (0 skipped).
Tests:
- src/coins.test.ts (new)
  - J1.S1.c1: unreturned closed order is credited
  - J1.S1.c2: guest order earns nothing
  - J1.S1.c3, I2: returned or refunded order earns nothing
  - J1.S2.c1: credits paid amount minus shipping, rounded down
  - J1.S2.c2, I1: second run for an order adds nothing

## T2 Show balance and credits
Covers: J2.
Verify: `bun test src` (0 skipped).
Tests:
- src/account.test.ts (new)
  - J2.S1.c1: balance and credits with order numbers show
  - J2.S1.c2: signed-out customer is sent to sign in
