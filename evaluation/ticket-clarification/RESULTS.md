# Vague company ticket trial

A fresh agent selected the updated decide skill for a CSV-export ticket, without
its name or path in the prompt. It read the local instructions and produced a
scoped decision record before any journey or implementation work.

## Inputs and method

The synthetic [ticket](inputs/ticket.md) requests CSV export for customers who copy
report data manually. Existing workspace access must be preserved; exporting all
rows is only a suggestion. [Project context](inputs/context.md) establishes existing
filters, TypeScript, and a PM who owns export scope; the engineer cannot approve
product-policy changes. Neither input was changed by the agent.

Run the optional case with an authenticated Codex CLI and Bun:

```sh
bun evaluation/discovery/run.ts vague-company-ticket
```

This uses model quota. The agent receives only the ticket, context, installed skills
and a request to clarify requirements and ask the most useful question. No expected
answer or parent findings are included. It writes only into a temporary fixture.
The runner uses the same configuration and read-evidence scoring described in the
[discovery trial](../discovery/RESULTS.md).

## Observed output

Read the [generated decision record](decisions.md) and [execution summary](results.json).
The copied record's `docs/context.md` and `docs/ticket.md` sources refer to the fixture
inputs linked above, where they were installed under those paths.

Parent review confirmed that the agent:

- Captured the manual-copying problem and intended CSV outcome without inventing a numeric success target.
- Preserved workspace authorization and treated the existing stack and filters as observations.
- Kept exporting all rows, the audience and the CSV field contract unresolved instead of promoting suggestions into approved requirements.
- Named the PM as answer owner and kept the engineer's preferred scope as a recommendation.
- Asked one focused next question about the customer role and whether existing report access covers it.
- Identified blocked export scope for the next builder; it produced neither a journey spine nor application code and contacted nobody.

The automated pass flag checks entry-point loading and process completion. Semantic
outcomes above are a review of this one output, not a general correctness guarantee.
The offline runner regression uses a stub executable and does not establish these
behaviors. No new shape skill, company integration or ticket-system connector was used.
