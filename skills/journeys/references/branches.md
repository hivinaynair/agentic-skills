# Branch review

Default to lightweight review. Select relevant questions by concrete effects and
accepted scope; deepen money, access, irreversible changes and data-integrity paths.
Read-only or local paths still need applicable access/error checks, but not an
invented seven-category matrix. Reference shared invariants rather than repeat
identical criteria. Record engineering actions without turning them into owner
policy questions. An unresolved applicable safeguard remains visible even when
product discovery stops.

Apply only relevant questions. A simple synchronous helper does not need invented
network outages; an API need not have a screen. Use accepted policy to answer.

- Person: invalid input, missing permission, cancellation, reload/resume, stale view?
- Dependency: unavailable, timeout, rate limit, unknown response, contradictory state?
- Events: duplicate, out of order, delayed, absent, replayed after partial completion?
- State: conflicting edits, concurrent requests, a crash between side effects?
- Recovery: what remains durable, what can retry, who can intervene, what is shown?
- Boundaries: tenant/account isolation, revoked access, deleted resources, leaked data?
- Effects: could this path duplicate, lose, reveal or publish something forbidden?
- Completion: does each branch reach an explicit outcome or reconnect? Does an
  indefinite wait need an owner-defined timeout or a visible pending state?

Domain-specific branches belong in the project's own sources. Do not import payment,
healthcare or other domain policies into unrelated work. Name the applicable invariant
and what must not happen, rather than adding generic failure text to every step.

Unknown is not the same as not applicable. Do not mark a risk not-applicable merely
because the request did not mention it. Use `open` when an applicable behavior lacks
policy, or cite an explicit exclusion agreed for this slice. For example, email
sending can be excluded while database failure during invite creation still needs
consideration. Do not treat the absence of an external service as absence of failure.

For a boundary between components, follow the producer's possible values through
the consumer. Include empty/null success, partial success, and classifier mismatches;
see [existing-project review](existing-projects.md). A generic dependency-failure
branch does not describe these distinct outcomes.
