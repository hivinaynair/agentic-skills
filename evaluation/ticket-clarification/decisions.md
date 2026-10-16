# REP-42 decision record

Customers currently copy report data manually for monthly review. The intended outcome is a CSV download from the reports page that reduces that work without weakening existing workspace access restrictions. The export audience and data scope still require product decisions. Sources: `docs/ticket.md`; `docs/context.md`.

## Decisions

| ID | Status | Decision | Why | Alternatives | Source | Date | Supersedes |
|---|---|---|---|---|---|---|---|
| D1 | accepted | CSV export must preserve the reports page's existing restriction to authorized members of the current workspace | Prevents the feature from expanding access to report data | Broaden export access: excluded by the ticket | `docs/ticket.md`; `docs/context.md` | 2026-10-16 | |
| X1 | accepted | REP-42 does not authorize changing report or workspace access policy | The assigned engineer cannot approve data-access changes | Change access policy as part of export: excluded | `docs/context.md` | 2026-10-16 | |

## Open questions

| ID | Status | Decision | Why | Alternatives | Source | Date | Supersedes |
|---|---|---|---|---|---|---|---|
| Q1 | open | Which customer role is the intended CSV user, and does that role already have report access? | Mara (PM) answers; blocks confirmation that the existing authorization model serves the intended customer without a policy change; recommend targeting an existing report-authorized role | Any authorized member; a specific existing role; a role that would require a separately approved access change | Unspecified in `docs/ticket.md`; ownership in `docs/context.md` | 2026-10-16 | |
| Q2 | open | Should the CSV contain only rows matching the report's current date and status filters, or a broader row set? | Mara (PM) answers; blocks export query behavior and scale expectations; recommend exporting the currently filtered result because it matches visible user context | Current page only; all filtered rows; all accessible rows regardless of filters | `docs/ticket.md` says exporting all rows is unagreed; existing filters noted in `docs/context.md` | 2026-10-16 | |
| Q3 | open | Which fields, ordering, and CSV column headers are required? | Mara (PM) answers; blocks the customer-visible file contract and acceptance tests; recommend starting from fields visible in the report while excluding presentation-only controls and any field not already accessible | Visible report fields; a product-defined subset; additional accessible report fields | Unspecified in `docs/ticket.md` | 2026-10-16 | |

## Observations

- The application is TypeScript, the reports page already has date and status filters, and CSV export does not exist. Source: `docs/context.md`.
- Support reports that customers manually copy report data for monthly review. Source: `docs/ticket.md`.
- Mara owns report behavior decisions. The implementing engineer may choose internal implementation details and propose product behavior, but cannot approve export scope or data-access changes. Source: `docs/context.md`.

## Handoff

Accepted scope currently covers adding a CSV download while retaining existing workspace authorization. Implementation is blocked on the intended customer role and the exported row and field contract. Ask Q1 first; its answer determines whether REP-42 can remain within the accepted access boundary. Then resolve Q2 and Q3 before specifying journeys or acceptance criteria. Do not treat the suggestions to export all rows or mirror visible fields as accepted requirements.
