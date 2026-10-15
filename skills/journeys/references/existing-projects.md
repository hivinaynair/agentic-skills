# Reviewing existing behavior

Read this when reconstructing a feature from code or checking a plan against an
existing implementation. Keep the review bounded to the requested feature.

1. Identify its entry points, durable writes, external handoffs and final consumer.
   Include manual, automatic and scheduled recovery paths that can change the same
   state. Record which related paths you excluded and why. Review this inventory
   separately from the graph: a valid graph can omit an entire goal.
2. At a handoff, compare what the producer can return with what the consumer actually
   interprets. Inspect normal, empty/null, partial-success and error results. A resolved
   call or HTTP success does not by itself prove a durable job ID or completed effect.
3. Compare shared classifiers at their boundaries: error producers, retry eligibility,
   provider/routing selection and UI display. Check whether the same representative
   value receives consistent treatment. Label synthetic probe values; do not claim
   they occur in production without finding an actual producer or runtime evidence.
4. Track writes before and after external effects, including failure while recording
   failure. Distinguish stored identifiers, acknowledgment, completion and recovery.
   Report possible crash/race outcomes as deductions unless exercised by a test.
5. Inspect test assertions. Classify evidence as helper behavior, source-text checking,
   mocked integration, real integration or live observation. Do not let a descriptive
   test title stand in for what the test executes.
6. Report findings with source path/revision, the observed condition, its consequence,
   and evidence level. If a small read-only probe resolves uncertainty, use one. Do
   not automatically add framework dependencies or run services to complete a review.

For an as-is reconstruction, use the schema’s source-backed O observations instead
of draft D transcriptions. Build the coverage inventory from source entry points
before mapping journeys. --coverage checks those mappings without requiring approval
of existing behavior. --ready still requires accepted decisions; never relabel an
observation to make it green. Report remaining open branch reviews separately from
coverage results. A future policy change still needs an accepted decision.
