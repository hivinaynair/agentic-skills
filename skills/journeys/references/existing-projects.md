# Reviewing existing behavior

Use for code reconstruction or plan/code comparison within the requested feature.

1. Inventory entry points, durable writes, external handoffs and final consumers,
   including manual, automatic and scheduled recovery affecting the same state.
   Record review boundaries separately from approved scope exclusions.
2. Compare producer outputs with consumer interpretation: normal, null/empty,
   partial and error results. HTTP/resolved-call success proves neither a durable
   job identity nor a completed effect.
3. Follow representative values through error producers, retry eligibility,
   provider classifiers and UI. Label constructed probes; do not claim they occur
   in production without an actual producer or runtime evidence.
4. Track writes around external effects and failure-recording failures. Distinguish
   stored identity, acknowledgment, completion and recovery. Label untested crash
   or race outcomes as deductions.
5. Inspect assertions: helper tests, source-text checks, mocked integration, real
   integration or live observation. A test title proves nothing about execution.
6. Report source path/revision, condition, consequence and evidence level. Run
   bounded read-only probes when useful; do not install dependencies or start
   services implicitly.

Use source-backed O observations for descriptions, never draft D transcriptions.
Inventory from sources before graph mapping. Report coverage and branch-review
results separately; the schema defines their gates. Observations never approve
future policy, even when structural validation passes.
