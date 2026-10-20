---
name: decide
description: Record product choices, exclusions and blocking questions when requirements are uncertain or need a handoff. Skip trivial edits and already specified implementation.
---

# Decide

Produce the smallest decision record another builder can use. Follow project
conventions; no particular stack, tooling or other skill is required. Read only
relevant records/reference sections, not entire histories.

1. Read the request, existing decisions and relevant evidence for one requested
   slice. Re-read shared files before editing. Preserve the host's planning format.
2. Separate owner-approved policy, observations, recommendations and unknowns.
   Cite sources; code, agent suggestions and silence do not authorize product policy.
3. Preserve settled scope and exclusions. Keep the choice, brief rationale and only
   alternatives that affected it. Link evidence instead of copying conversations.
   Internal naming, retries and helper layout belong to the builder unless they
   change a product tradeoff.
4. Before asking, name the accepted outcome blocked by the answer. Ask only when
   it changes in-scope user behavior/business policy and blocks the next useful
   slice. Record a recommendation, alternatives, blocked work and answer owner.
   Ask the highest-impact question; honor requested batches and continue independent
   work. Do not invent limits, deadlines or policy to fill gaps.
5. For new records, use [record format](references/record-format.md), normally
   `docs/decisions.md`. The optional journeys checker needs its documented table;
   report incompatible formats instead of silently migrating them.
6. Keep IDs permanent. Replace changed accepted policy with a new decision naming
   what it supersedes; preserve history and trace affected journeys/tasks. Drafts
   may change in place. Do not silently rewrite acceptance criteria to fit new policy.

Honor the owner's complexity budget. Prefer existing accepted actions to more
settings/workflows. “Next gap” means the next material blocker inside scope; if
none remains, stop. Exclusion and deferral are valid completion. Reopen settled
policy only on an owner request or concrete conflicting evidence.

Keep each fact in one authoritative place; omit transcripts, repeated summaries
and empty sections. Expand only for a concrete ambiguity or consequential risk.
Close with the accepted scope or change, material tradeoff, blockers and next step.
No approval ceremony is needed for already authorized facts. Done means enough
policy to proceed or explicit blockers, not every future question answered.
Planning alone does not authorize implementation, commits or publishing.
