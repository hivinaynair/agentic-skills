# Build from approved designs

Start from the [handoff file](../../verify/references/design-coverage.md). Given
only a design link or card, find the handoff file it names. Without one, gather
the approved designs, devices, routes and setup from the request and repository
into that format, and ask about whatever stays unclear. Build the requested
scope and treat other designs as references.

Before coding, freeze the board list and run the inventory check. Report missing
devices, states, routes or setup, and continue with independent work in the
approved scope.

For a large handoff, run independent discovery in parallel when the harness has
subagents: reading the designs, mapping the affected routes and components, and
finding the browser setup and fixtures. Ask each for concise references and
blockers, give design-tool reads to a worker with that tool's access, and keep
one owner for the board list and shared code.

## Compose from the host system

Build each screen from the host's components and tokens, in the order the
handoff gives:

1. `components` with `reuse`: use the named component and its existing props.
2. `components` with `restyle`: change that component, keeping its public API
   unless the handoff says otherwise.
3. `components` with `new`: add a shared component in the host's component
   folder, built from its primitives and tokens.
4. Regions the map leaves out: match them to existing components first.

Read the design source's exported structure and styles only for the parts the
host system does not already define, and translate each value to the nearest
token or scale step. Exports often write tokens as arbitrary values
(`bg-(--color-primary)`) and draw tables or grids as stacks of rows: use the
utility the token backs (`bg-primary`) and the host's table or grid. Take
values from the export or the handoff, never by measuring a screenshot. The host's styling conventions stay in force: a
per-feature stylesheet or literal value appears only where `exceptions` lists
it. Before verifying, scan the diff for new stylesheets and literal colours,
sizes or spacing, and fold each into a token or report it as a design gap.

A depicted field, action or status the code and accepted decisions lack is new
behaviour. Stop on it and raise the question as the build skill does.

## Reach and check

Seed each state with its `setup`, at its `viewport`, with `clock` fixed for
date-dependent states. Verify in a local app or preview with existing test data
or fixtures first. Provision a fresh database only if a required check needs
isolation the existing setup cannot provide. Follow the host project's test
environment rules. For behaviour changes, use the approved journeys and the
build steps for their tasks. Group related work internally and continue through
the full authorised handoff.

Build each `loadingFor` board's skeleton alongside its loaded layout, sharing
layout and sizing rules so the two keep the same geometry.

Run the verify skill across the handoff's boards and relevant journey criteria.
Return one coverage report with browser evidence and any unresolved results.
The coverage checker must pass before claiming the whole handoff is complete.
Follow the host project's Git and delivery rules.
