# Coins decisions

Acme Outdoor store. Owner of product decisions: Priya (PM). Finance owns tax.

## Frame
- D1 accepted — Problem: few customers come back for a second order.
- D2 accepted — Primary user: a signed-in customer who has placed an order.
- D3 accepted — First usable outcome: a customer earns coins on an order and sees their balance.
- X1 accepted — Spending coins at checkout is the next slice, not this one.

## Decisions
- D4 accepted — A customer earns 1 coin per 1 unit of currency paid, rounded down, excluding shipping.
- D5 accepted — Coins are credited when the 30-day return window closes, never at checkout.
- D6 accepted — An order returned or refunded before the window closes earns no coins.
- D7 accepted — Only signed-in customers earn coins; guest orders earn none.
- D8 accepted — The account page shows the balance and each credit with its order number.
- D9 accepted — Failure default: when crediting fails or its result is unknown, nothing is credited and it is retried later.
- D10 accepted — Decisions approved for build: coins earning (D4–D9). Approved by Priya.
- D11 accepted — Approved for build: coins J1–J2, independent review passed.
