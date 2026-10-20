# Decision record

Default: `docs/decisions.md`. One authoritative record; other docs link its IDs.
Use the columns below if you want the optional automated checker. Do not put literal
pipes inside table cells. Empty cells are allowed except ID, Status and Decision.

| ID | Status | Decision | Why | Alternatives | Source | Date | Supersedes |
|---|---|---|---|---|---|---|---|
| D1 | accepted | Only workspace admins can invite members | Restrict membership changes | All members can invite: rejected by owner | Owner request, 2026-10-15 | 2026-10-15 | |

Statuses: `draft`, `accepted`, `superseded`. D IDs represent decisions; X IDs record
explicit exclusions. Only accepted D/X rows can support build-ready behavior.
Use the actual conversation date, not the date from this example. Keep the choice
and rationale short; link the evidence rather than repeat the conversation. Leave
optional cells empty when there is nothing useful to record. Do not add a narrative
spec, meeting transcript or second summary of every row.

## Open questions

| ID | Status | Decision | Why | Alternatives | Source | Date | Supersedes |
|---|---|---|---|---|---|---|---|
| Q1 | open | How long does an invitation remain usable? | Blocks expiration behavior; owner answers; recommend choosing a duration based on expected onboarding delay | No expiration; fixed expiration | Unspecified in request | 2026-10-15 | |

Keep Q1 when answered: set its status to `resolved` and link the new D ID in its
Decision cell. Update dependent journeys to cite the accepted D ID. Questions are
not themselves policy, even after resolution. Do not reuse Q1.

When D1 changes, mark D1 `superseded`, add accepted D2 with `Supersedes` = `D1`,
and review all references to D1. Rejected draft IDs use status `retired`, not deletion.
Never reuse an ID. Keep an `Observations` section for sourced current behavior and
an `Assumptions` section for explicitly labeled provisional reasoning, if needed.
Neither section confers accepted status. Do not create empty sections by habit.

When a journey spine exists, machine-readable observations live in its `observations`
list as O IDs, each with a statement and source ref/revision/locator. Link to those
IDs rather than duplicating their definitions here. Before a spine exists, keep sourced
prose in Observations. Do not manufacture draft D rows merely to transcribe existing
code. An observation never becomes accepted policy without a separate owner decision.

Keep active policy easy to retrieve. For a long record, add a short current-scope
summary linking active D/X IDs; keep historical rows as evidence. On a partial
supersession, write replacement decisions preserving the still-valid clauses and
mark the old compound row superseded. Update affected references rather than leave
contradictory accepted text requiring a distant override note. Do not migrate old
records merely to satisfy this preference without a requested policy update.

Use Q IDs for owner policy blockers. Keep engineering actions (for example retry
identity or transaction boundaries) and release evidence (for example physical
printer validation) separately labeled under existing accepted policy. A proposed
engineering solution is not a newly accepted owner decision. Closed questions,
explicit exclusions and deferrals do not need replacement questions.
