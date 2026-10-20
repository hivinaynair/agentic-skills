---
name: decide
description: Capture product decisions, scope, alternatives and blocking questions for a feature or project. Use when requirements are uncertain or decisions need to survive an agent handoff; skip trivial edits and already-specified implementation work.
---

# Decide

Turn the owner's intent into a small decision record another builder can use.
Respect project instructions and existing document locations. This skill does not
require a particular language, framework, runtime, or the journeys skill.

Write the smallest record that lets the owner make an informed choice and a
builder proceed correctly. Keep each fact in one authoritative place; reference
it elsewhere. Omit repeated context, transcripts and empty sections. Add detail
only to resolve a concrete ambiguity or consequential risk. In replies, lead with
the decision or change, its tradeoff and any blocker; do not recite the document.

1. Read the request, relevant existing decisions and only the code/docs needed for
   this change. Re-read before editing shared files. Start with one feature unless
   the user asks for the whole project. Do not overwrite existing planning systems.
2. Separate accepted owner decisions, observed current behavior, recommendations,
   and unknowns. Cite the source of accepted decisions and observations. Code is
   evidence of current behavior, not approval of future policy. Never promote an
   agent suggestion or silence to an accepted decision.
3. Preserve settled answers. Record scope, behavior, constraints and rejected
   alternatives that matter. Keep rationale brief; omit alternatives that did not
   affect the choice. Link source evidence instead of copying long owner quotes. Internal names and helper layout are the builder's
   choice; do not turn them into owner questions.
4. Before asking, name the accepted in-scope outcome that cannot proceed without
   the answer. Ask only if it changes user-visible behavior or business policy and
   blocks the next useful slice. Record the recommendation, alternatives, blocked
   work and answer owner; ask the single highest-impact question. Engineering
   mechanics belong to the builder unless they introduce a new product tradeoff.
   Continue independent work. Honor an explicitly requested batch. Do not invent
   deadlines, limits or policies.
5. Use the [record format](references/record-format.md) for a new record, defaulting
   to `docs/decisions.md`. Preserve an existing format unless migration is requested.
   The optional journeys checker requires the documented table format; report an
   unsupported format instead of silently converting it.
6. Keep stable IDs. Draft recommendations can change in place. When an accepted
   decision changes meaning, append a new decision that supersedes it; preserve the
   old row. Trace affected references and report what needs review. Never silently
   rewrite acceptance criteria to accommodate a changed policy.
7. End with the accepted scope, unresolved blockers and next useful step. Do not
   demand an approval ceremony for facts already authorized in the conversation.

Honor the owner's complexity budget when choosing what to propose. Prefer existing
accepted actions and assisted setup over additional settings or workflows. A request
for the “next gap” means the next material blocker inside the agreed scope, not a
reason to keep discovering optional features. If none remains, say so and stop.
Exclusion or deferral is a valid completed decision; reopening it needs a new owner
request or concrete conflicting evidence, not another hypothetical edge case.

Done means the requested slice has enough accepted policy to proceed, or its
remaining blockers are explicit. It does not mean every future product question
must be answered. Planning does not authorize implementation, commits or publishing.
