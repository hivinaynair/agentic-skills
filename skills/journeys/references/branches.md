# Branch review

Apply relevant cases; do not invent outages or UI for steps without them.

- Person: invalid input, missing permission, cancellation, reload/resume, stale view?
- Dependency: outage, timeout, rate limit, unknown or contradictory response?
- Events: duplicate, reordered, delayed, absent, replayed after partial completion?
- State: conflicting edits, concurrent requests, crash between effects?
- Recovery: durable state, retry identity, operator action, visible outcome?
- Boundaries: account isolation, revoked access, deleted resources, exposed data?
- Effects: could this duplicate, lose, reveal or publish something forbidden?
- Completion: explicit outcome or reconnection? Does indefinite waiting need an
  owner-defined timeout or visible pending state?

Name applicable invariants and forbidden effects. Domain rules come from the host
project; do not import another domain's policies.

Unknown is not not-applicable. Missing policy means `open`; `not-applicable` needs
impossibility or an accepted exclusion. Excluding email does not exclude database
failure. Review this reasoning; a nonempty explanation cannot prove it.

At component handoffs, follow actual producer values through consumers: null/empty
success, partial success and classifier mismatches. See
[existing-project review](existing-projects.md) for the source-review procedure.
