# Build from approved designs

Read the handoff or equivalent notes in the request or repository. Identify the
approved designs, visual criteria, required devices, app entry points, and how to
reach each state. Build the requested scope. Treat other designs as references.
Ask about scope or behavior that remains unclear.

Before coding, freeze the approved design list and run the
[inventory check](../../verify/references/design-coverage.md). Report missing
required screens or states and continue with independent work in approved scope.
Read layout, styles, tokens, and assets from the design source or handoff where
available. Map them to existing components and tokens. Report design gaps that
block implementation.

For presentation changes, implement the visual criteria and run focused checks.
Verify in a local app or preview with existing test data or fixtures first.
Provision a fresh database only if a required check needs isolation the existing
setup cannot provide. Follow the host project's test environment rules. For
behavior changes, use the approved journeys and the build steps for their
tasks. Group related work internally and continue through the full authorized
handoff.

If the changed UI has a loading skeleton, update it alongside the loaded layout.
Reuse shared layout and sizing rules where possible. Run the verify skill
across the handoff's approved states and relevant journey criteria. Return one
coverage report with browser evidence and any unresolved results. The coverage
checker must pass before claiming the whole handoff is complete. Follow the host
project's Git and delivery rules.
