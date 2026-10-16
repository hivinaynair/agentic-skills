# Decision record

Default: `docs/decisions.md`. Keep one authoritative record; downstream docs cite
its IDs. For vague tickets, briefly state the users' problem, intended outcome and
constraints with sources. Unknown or contradictory policy becomes Q rows, not
invented requirements.
Label alternatives rejected only when a source rules them out.

The optional checker expects these columns. No literal pipes inside cells; ID,
Status and Decision must be nonempty. Use actual conversation dates.

| ID | Status | Decision | Why | Alternatives | Source | Date | Supersedes |
|---|---|---|---|---|---|---|---|
| D1 | accepted | Only admins can invite | Restrict membership changes | All members: rejected | Owner request | 2026-10-15 | |
| X1 | accepted | No email delivery | Shareable links suffice | Send email: rejected | Owner request | 2026-10-15 | |
| Q1 | open | Which role does acceptance grant? | PM answers; blocks new membership; recommend an existing default role if available | Fixed role; inviter selects | Unspecified in ticket | 2026-10-15 | |

- **D**: decision. **X**: explicit scope exclusion. Status: `draft`, `accepted`,
  `superseded` or `retired`. Only accepted D/X rows support readiness.
- **Q**: question, with `open`, `resolved` or `retired` status. Include answer owner,
  blocked work and recommendation in Why; label unknown ownership. Recommendations
  from implementers without policy authority remain proposals.
- When Q1 is answered, retain it as `resolved`, link the new accepted D ID in its
  Decision cell, and update dependent journeys to cite D. Resolved Q rows are not policy.
- When accepted D1 changes meaning, mark it `superseded`; add D2 with
  `Supersedes: D1` and review affected references. Drafts may change in place;
  rejected drafts become `retired`. Preserve history and never reuse IDs.

Keep sourced observations and labeled assumptions in prose only when needed.
Once a journey spine exists, observations live there as O IDs with source
`ref`, `revision` and `locator`; link them instead of duplicating definitions.
Never transcribe code into draft D rows merely to satisfy the checker. Observations
and assumptions do not confer approval.
