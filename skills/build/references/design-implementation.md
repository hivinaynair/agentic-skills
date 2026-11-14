# Build from approved designs

Start from the [scope manifest and page handoffs](../../verify/references/design-coverage.md).
Given only a design link or card, find the manifest it names. A `draft` handoff
needs the owner's go-ahead before building; its
`gaps` stay open and go in your report. Without one, gather
the approved designs, devices, routes and setup from the request and repository
into that format, and ask about whatever stays unclear. Build the requested
scope and treat other designs as references.

Before coding, reconcile the source inventory and required screen/state/device
matrix, then run the scope check with `--ready`. Freeze the board IDs and pinned
references; check a requested subset with `--focus` rather than shrinking the scope.
Report missing devices, states, routes or setup and continue independent approved
work. If the owner explicitly authorized a draft, its readiness and final acceptance
stay failed: work on confirmed parts using ready page handoffs or manual focused
observations, and retain every gap. That authorization never turns partial work
into a complete design delivery.

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

Read the cached approved structure and relevant computed styles for every distinct
layout, including regions built with existing components. Reuse unchanged exports
across states and retries. Match approved geometry, type, spacing and responsive
behavior; use the token that resolves to the approved value. Exports often write tokens as arbitrary values
(`bg-(--color-primary)`) and draw tables or grids as stacks of rows: use the
utility the token backs (`bg-primary`) and the host's table or grid. Take
values from the export or the handoff, never by measuring a screenshot. The host's styling conventions stay in force: a
per-feature stylesheet or literal value appears only where `exceptions` lists
it. Before verifying, scan the diff for new stylesheets and literal colours,
sizes or spacing, and fold each into a token or report it as a design gap.

The approved boards define the visual target. Preserve the host's engineering and
accessibility requirements; surface conflicts on affected regions and record an
approved exception rather than silently substituting a layout or rounding a value.
Where a rule can live in a shared component, such as one button size for every
action row or dialog footer, put it there instead of styling each screen.

A depicted field, action or status the code and accepted decisions lack is new
behaviour. Stop on it and raise the question as the build skill does.

## Reach and check

Build and compare one representative Desktop/Phone pair first. Fix shared layout
and component errors before expanding to the remaining states; this is an internal
check against existing approval, not a new owner gate.

Seed each state with its `setup`, at its `viewport`, with `clock` fixed for
date-dependent states. Verify in a local app or preview with existing test data
or fixtures first. Provision a fresh database only if a required check needs
isolation the existing setup cannot provide. Follow the host project's test
environment rules. For behaviour changes, use the approved journeys and the
build steps for their tasks. Group related work internally and continue through
the full authorised handoff.

Build each `loadingFor` board's skeleton alongside its loaded layout, sharing
layout and sizing rules so the two keep the same geometry.

Use focused verify passes while building. Capture once per distinct state/device
and share it across matching criteria; rerun affected states and shared-component
dependents after a fix. Save the complete final pass for the finished delivery.
Run verify across every scoped board and relevant journey criterion at that point.
Return one coverage report with browser evidence and any unresolved results.
The coverage checker must pass before claiming the whole handoff is complete.
Follow the host project's Git and delivery rules.
