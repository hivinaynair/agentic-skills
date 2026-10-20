# Branch review

Select questions by concrete effects and accepted scope. Deepen consequential
money, access, irreversible changes and data integrity. Local/read-only work still
needs applicable checks, not invented outages or a blanket matrix.

- Person: invalid input, permission, cancellation, reload/resume, stale view?
- Dependency: unavailable, timeout, rate limit, unknown/contradictory result?
- Events: duplicate, delayed, out of order, absent, replay after partial completion?
- State: conflicting edits, concurrent requests, crash between effects?
- Recovery: what survives, retries, intervention and visible outcome?
- Boundary: tenant/account isolation, revoked access, deletion, leaks?
- Effect: forbidden duplication, loss, disclosure or publication?
- Completion: named outcome/reconnection; visible pending state or agreed timeout?

Name the invariant and forbidden effect; reference shared safeguards rather than
repeat generic failures. Keep domain policy in project sources, not imported from
unrelated work. Engineering actions need not become owner questions, and remain
visible after product discovery stops.

Unknown is not not-applicable. Use open for unresolved applicable behavior; excluding
email does not exclude database failure. An exclusion needs accepted scope support.
At component boundaries, follow actual producer values through consumers, including
empty/null success, partial success and classifier mismatches. Generic dependency
failure text does not cover these; see [existing-project review](existing-projects.md).
