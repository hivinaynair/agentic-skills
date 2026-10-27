---
name: decide
description: Settle what to build before code. Frames a raw idea or vague ticket, records the owner's decisions and non-goals, and asks the next blocking product question. Use when an idea or ticket needs sharpening, requirements are uncertain, or decisions need a handoff.
---

# Decide

You help the **owner** settle what to build. The owner decides product rules:
who may do what, and what a person sees. The **builder** decides how to build them.
The owner may not be the person you are working with: on a company ticket it is
often a PM or designer.
Record owner decisions in `docs/decisions.md` using the [record format](references/record-format.md).
If the project already keeps a decision record, add to it in its own format.

## Steps

1. **Read.** Read the request, the existing record and the code or docs it touches.
   Done when you can say what is decided, what the code does today, and what is missing.

2. **Frame** (raw ideas and vague tickets). When the request does not yet say who it
   is for, what problem it solves and what outcome would satisfy it, settle five
   things: problem, primary user, first usable outcome, non-goals and success signal.
   For a ticket, take what the ticket and project already establish, and separate
   firm requirements from suggested solutions, assumptions and contradictions; ask
   only for what is missing. Propose a missing success signal or an obvious non-goal
   as a draft line rather than a question; neither blocks the build. Done when each
   is a line under `## Frame`; non-goals are X lines. A specified feature goes
   straight to Ask.

3. **Ask.** First compare the request with known facts and accepted decisions, and
   name every conflict; a request that changes an accepted decision is a question
   too ("Replace D52 with …?"). Then find the missing rules that change what a person
   can do or see in the first slice, including who can see shared data, existing
   data, and changes made outside the app. Sort each gap:
   - **Question**, when the answer changes what gets built and you cannot pick
     safely. Write it for someone who has not read your docs: the context they need,
     the options, your recommendation, and who answers (`Owner: PM`, or
     `Owner: unknown`).
   - **Assumption**, when your choice is low-stakes and easy to change: a `draft`
     D line starting `Assumed:`. The owner accepts or overrides all of them at once
     in the journeys Ready summary. Who can see or share what, money, and the
     timing of the core flow are never low-stakes: always ask.

   Both stay proposals until the owner accepts them; prepare questions for them
   rather than contacting them yourself. Reuse an existing **failure default** if
   the record has one; otherwise assume one ("when an action fails or its result is
   unknown, the person sees a retryable error and no partial change is kept"). Ask
   the highest-impact question first. Done when no open question blocks the first
   slice.

4. **Record.** Write each answer, and each rule the owner volunteers, as an accepted
   D line: one rule, under 30 words, with a why only when it is not obvious. A rule
   you infer from an answer but the owner did not state is an `Assumed:` draft. Mark
   the question resolved with just `Answered by` and every line it produced
   (`Answered by D21–D24, X3`); the decisions hold the content. When an answer replaces an accepted
   decision, end the new line with `Supersedes: D<n>`, mark the old one superseded and
   restate any part that still holds. What the code does today is an observation:
   once a journey file exists, record it there as an O line. Done when every answer
   from this session is a line.

5. **Report.** Reply with the accepted scope, which paths are ready to map and which
   are blocked on named questions, and the next step, usually the journeys skill.

Retries, transactions, idempotency, timeouts, storage and naming are builder
choices; they belong in tasks. One line per decision: link tickets, ADRs or docs
for longer reasoning. Stop when the first slice is unblocked; excluding or
deferring something is a complete answer.
