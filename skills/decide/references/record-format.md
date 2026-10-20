# Decision record

Default: `docs/decisions.md`. Other documents link IDs instead of repeating policy.
For the optional checker, use this table; no literal pipes in cells. Only ID,
Status and Decision must be nonempty. Keep reasons brief and link source evidence.

| ID | Status | Decision | Why | Alternatives | Source | Date | Supersedes |
|---|---|---|---|---|---|---|---|
| D1 | accepted | Only admins can invite | Restrict membership changes | All members: rejected | Owner request | 2026-10-15 | |

D IDs are decisions, X IDs exclusions. Statuses: draft, accepted, superseded,
retired. Only accepted D/X rows support policy readiness; use actual source dates.
Rejected drafts become retired. Never reuse IDs.

## Open questions

Use the same columns for Q IDs (open, resolved, retired):

| ID | Status | Decision | Why | Alternatives | Source | Date | Supersedes |
|---|---|---|---|---|---|---|---|
| Q1 | open | How long is an invitation usable? | Blocks expiration; owner answers; recommend a duration matching onboarding | No expiration; fixed duration | Unspecified | 2026-10-15 | |

On resolution, keep Q1 as resolved and link the accepted D ID in Decision. Update
journeys to that D ID; even resolved questions are not policy. Keep engineering
actions and release checks separately labeled under existing policy, not as owner
questions. Closed questions/exclusions/deferrals need no replacement question.

To replace D1, mark it superseded, append D2 with Supersedes=D1, and review affected
references. For partial replacement, preserve valid clauses in replacement rows
instead of leaving contradictory accepted text with distant overrides. Keep history;
add a short active-scope ID index only when retrieval needs it. Do not migrate old
records without a requested update.

Observations describe sourced behavior; assumptions label provisional reasoning.
Neither approves policy. Omit empty sections. Once a spine exists, store observations
there as O IDs with source ref/revision/locator and link them here. Before that,
sourced prose is sufficient. Do not create draft D rows just to transcribe code,
or duplicate conversations, narrative specs and summaries of every row.
