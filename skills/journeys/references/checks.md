# Outcome checks

Every journey answers four checks from the owner's side: what the person sees.

| Check | Question for the owner |
|---|---|
| denied | What does someone who is not allowed see? |
| invalid | What happens with bad input, an unknown link or a deleted target? |
| failed | What does the person see when it fails or the result is unknown? |
| repeated | What do a double submit, a retry or a repeat of a finished action do? |

Answer each one in the journey's `Checks:` list, or once in the file header when
the answer holds for every journey (usually `failed`); a journey's own answer wins:

- `- denied: J1.S1.c2` names the criteria, steps, invariants or decisions that cover it.
- `- failed: D8` usually cites the feature's failure default.
- `- repeated: n/a — read-only page` gives a concrete reason it cannot happen.
- `- invalid: open — Q2` waits for an owner answer.

Unknown is open. An exclusion covers only what it names: excluding email still
leaves a failed save to answer.

Go deeper where money, access, privacy, irreversible writes or data integrity are
at stake. Ask what other people can see, what existing data looks like on day one,
what happens when another system (an admin dashboard, a payment provider) changes
the same state, and what two concurrent requests, a duplicate event or a crash
halfway through would do. Write the answer as an invariant, such as "never charge
twice". The builder picks the mechanism (idempotency keys, transactions, retries)
and records it as a builder note in tasks.
