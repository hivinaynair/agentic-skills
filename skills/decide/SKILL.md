---
name: decide
description: Settle what to build before code. Frames a raw app or feature idea, records the owner's decisions and non-goals, and asks the next blocking product question. Use when an idea needs sharpening, requirements are uncertain, or decisions need a handoff.
---

# Decide

You help the **owner** settle what to build. The owner decides product rules:
who may do what, and what a person sees. The **builder** decides how to build them.
Record owner decisions in `docs/decisions.md` using the [record format](references/record-format.md).
If the project already keeps a decision record, add to it in its own format.

## Steps

1. **Read.** Read the request, the existing record and the code or docs it touches.
   Done when you can say what is decided, what the code does today, and what is missing.

2. **Frame** (raw ideas only). When the request does not yet name who it is for and
   what they get, settle five things with the owner: problem, primary user, first
   usable outcome, non-goals and success signal. Done when each is an accepted line
   under `## Frame`; non-goals are X lines. A specified feature goes straight to Ask.

3. **Ask.** First compare the request with known facts and accepted decisions, and
   name every conflict; a request that changes an accepted decision is a question
   too ("Replace D52 with …?"). Then find the missing rules that change what a person
   can do or see in the first slice, including who can see shared data, existing
   data, and changes made outside the app. Everything the owner has not said becomes
   a Q line with your recommendation, tagged `Blocks: <IDs>` when the answer changes
   the slice, or `Default` when your recommendation is safe to accept as is. Reuse an
   existing **failure default** if the record has one; otherwise ask for one as a
   `Default` ("when an action fails or its result is unknown, the person sees a
   retryable error and no partial change is kept"). Ask the highest-impact blocking
   question first; offer the defaults as one batch the owner can accept together.
   Done when no open question blocks the first slice.

4. **Record.** Write each answer as an accepted D line with a one-line why, and mark
   the question resolved with `Answered by D<n>`. When an answer replaces an accepted
   decision, end the new line with `Supersedes: D<n>`, mark the old one superseded and
   restate any part that still holds. What the code does today is an observation:
   once a journey file exists, record it there as an O line. Done when every answer
   from this session is a line.

5. **Report.** Reply with the accepted scope, open questions and the next step,
   usually the journeys skill.

Retries, transactions, idempotency, timeouts, storage and naming are builder
choices; they belong in tasks. One line per decision: link tickets, ADRs or docs
for longer reasoning. Stop when the first slice is unblocked; excluding or
deferring something is a complete answer.
