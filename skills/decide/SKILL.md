---
name: decide
description: Clarify vague tickets or ideas into product decisions, scope and open questions. Use for uncertain requirements or decision handoffs; skip trivial edits and fully specified implementation.
---

# Decide

Input: a ticket, idea or discussion plus project context. Output: one decision
record, default `docs/decisions.md`. No other skill or runtime is required.

1. Read project instructions, existing decisions and relevant code/docs. Preserve
   host formats and settled answers; re-read shared files before editing. Scope to
   the requested feature unless asked otherwise.
2. Establish users, their problem, intended outcome, scope and constraints before
   detailing a solution. Extract known answers from sources; flag contradictions
   and assumptions. Ask what observable result would satisfy an unclear ticket;
   invent neither success metrics nor business rules.
3. Keep accepted decisions, observations, recommendations and unknowns distinct.
   Preserve source meaning; infer no extra requirements or exclusions. Cite policy
   authority and observation sources. Existing code, suggestions and
   silence do not approve policy. The implementing engineer may not own product
   choices; identify the answer owner or record that ownership is unknown.
4. Record missing policy as questions with recommendation, alternatives, blocked
   work and answer owner. Ask the question that unblocks most work, one at a time
   unless a batch is requested. Continue independent work. Internal implementation
   choices belong to the builder. Prepare stakeholder questions without contacting
   anyone unless authorized.
5. When writing the record, read [record format](references/record-format.md) for
   fields and ID lifecycle. Keep context brief; link rather than duplicate specs.
   Preserve existing formats unless migration is requested; report checker
   incompatibility instead of silently converting them. Never reuse IDs or silently
   rewrite criteria to fit changed policy.
6. End with accepted scope, named blockers and next action. A journeys handoff
   distinguishes scope ready to map from paths blocked on questions; it need not
   wait for unrelated answers. Reuse existing authorization without reapproval.

Done: enough accepted policy for the slice, or explicit blockers. Planning alone
adds no authorization to implement, commit or publish.
