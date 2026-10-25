# Existing code

Use this when mapping a feature that already exists.

1. **Entry points.** List every way into the feature: screens, endpoints, jobs and
   retries that change the same state. Each becomes a goal; a goal another spec
   already covers is `→ elsewhere: <spec>`.
2. **Observations.** Record what the code does as O lines with a source:
   `- O1: Retries reset the job before queueing it. Source: src/retry.ts@abc123 retryJob`.
   Cite them in Basis. The owner decides which become accepted decisions.
3. **Handoffs.** Where one component calls another, compare what the producer can
   return (success, empty, partial, error) with what the consumer handles. Gaps are
   open checks or questions.
4. **Writes and effects.** Follow writes before and after external calls. Ask what
   a crash between them leaves behind. Report it as a deduction unless a test exercises it.
5. **Tests.** Read what each test asserts, beyond its title. Say whether evidence
   is a unit test, a mocked integration, a real integration or a live observation.

A draft `check` passes on observations alone. `--ready` needs accepted decisions,
because the owner, not the current code, sets policy.
