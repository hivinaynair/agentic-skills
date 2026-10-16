---
name: decide
description: Clarify vague feature tickets and capture product decisions, scope and blocking questions. Use when requirements are uncertain or decisions need to survive a handoff; skip trivial edits and already-specified implementation work.
---

# Decide

Turn the owner's intent into a small decision record another builder can use.
Respect project instructions and existing document locations. This skill does not
require a particular language, framework, runtime, or the journeys skill.

1. Read the request, relevant existing decisions and only the code/docs needed for
   this change. Re-read before editing shared files. Start with one feature unless
   the user asks for the whole project. Do not overwrite existing planning systems.
2. For a feature ticket, clarify its purpose before detailing its proposed solution.
   Extract the affected users, their problem, intended outcome, scope and constraints
   from the ticket and project context. Distinguish explicit requirements from
   tentative suggestions, assumptions and contradictions. If the outcome is unclear,
   ask what observable result would satisfy the ticket; do not invent a success metric.
   Read what the project can answer instead of asking the user to repeat it. Keep
   established context brief in the decision record; do not create another spec.
3. Separate accepted owner decisions, observed current behavior, recommendations,
   and unknowns. Cite the source of accepted decisions and observations. Code is
   evidence of current behavior, not approval of future policy. Never promote an
   agent suggestion or silence to an accepted decision.
4. Preserve settled answers. Record scope, behavior, constraints and rejected
   alternatives that matter. Internal names and helper layout are the builder's
   choice; do not turn them into owner questions.
5. For missing user-visible or business rules, record an open question with its
   recommendation, alternatives, blocked work and answer owner. Ask the single
   question that unblocks the most work. Continue independent work. If the owner
   explicitly wants a batch, honor that. Do not invent deadlines, limits or policies.
   The person implementing a company ticket may not own product policy. Identify
   the appropriate answer owner (for example, PM or designer); when unknown, record
   that uncertainty. An implementer's proposal remains a recommendation unless they
   have authority to settle that choice. Prepare a question for the owner without
   contacting them unless authorized. Internal technical choices remain the builder's.
6. Use the [record format](references/record-format.md) for a new record, defaulting
   to `docs/decisions.md`. Preserve an existing format unless migration is requested.
   The optional journeys checker requires the documented table format; report an
   unsupported format instead of silently converting it.
7. Keep stable IDs. Draft recommendations can change in place. When an accepted
   decision changes meaning, append a new decision that supersedes it; preserve the
   old row. Trace affected references and report what needs review. Never silently
   rewrite acceptance criteria to accommodate a changed policy.
8. End with the accepted scope, unresolved blockers and next useful step. Before
   handing off to journeys, distinguish the scope with enough policy to map from
   paths still blocked on named questions. Do not hide those blockers by treating
   the ticket as complete, or require unrelated questions to be settled first. Do not
   demand an approval ceremony for facts already authorized in the conversation.

Done means the requested slice has enough accepted policy to proceed, or its
remaining blockers are explicit. It does not mean every future product question
must be answered. Planning does not authorize implementation, commits or publishing.
