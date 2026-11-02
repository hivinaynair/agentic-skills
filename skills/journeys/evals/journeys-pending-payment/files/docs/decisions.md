# Studio bookings decisions

Stretch Studios runs three yoga studios: Indiranagar, Koramangala and HSR. Maya
(operations lead) owns product decisions; Arjun (finance) owns refunds and tax.

## Frame
- D1 accepted — Problem: walk-in customers wait while desk staff write bookings on paper.
- D2 accepted — Primary user: desk staff at a studio.
- D3 accepted — First usable outcome: desk staff book a walk-in into today's class and take payment.
- X1 accepted — Members booking online is a later slice.
- X2 accepted — Waitlists and gift cards are later slices.

## Decisions
- D4 accepted — A class has a fixed capacity set by its studio's manager.
- D5 accepted — Refunds always go back to the original payment method. Owner: Arjun.
- D6 accepted — Members see only their own bookings and payments.
- D7 accepted — Failure default: when an action fails or its result is unknown, the person sees a retryable error and no partial change is kept.
- D8 accepted — Desk staff see, book and cancel only their own studio's classes.
- D9 accepted — Each studio sets its own class prices; the desk sees the price before taking payment.
- D10 accepted — The desk takes card, through the counter card terminal, or cash.
- D11 accepted — While a card payment's result is unknown, the booking shows "Checking payment" and holds the spot for 10 minutes.
- D12 accepted — When the card payment is confirmed the booking is confirmed; when it is declined, or 10 minutes pass with no result, the spot is released.
- D13 accepted — A cash booking is confirmed when the desk records the cash received.
- D14 accepted — A full class cannot be booked; the desk sees "Class full".
- D15 accepted — Cancelling 12 hours or more before the class starts refunds in full; later than that refunds nothing. Owner: Arjun.
- D16 accepted — Decisions approved for build: desk bookings (D4–D15). Approved by Maya.
