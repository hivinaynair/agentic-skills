# Paper extension

Optional skills for teams that design in [Paper](https://paper.design). They
sit between journeys and build: design the approved journeys in Paper, then
hand the approved boards to build as the core
[handoff file](../../skills/verify/references/design-coverage.md). The core
skills never need them; build and verify read the handoff file the same way
whatever tool made the designs.

```mermaid
flowchart LR
    system["paper-design-system"] -.->|tokens, library, DESIGN.md| design
    journeys["journeys"] --> design["paper-design"]
    design -->|owner approves the boards| handoff["paper-handoff"]
    handoff -->|handoff file| build["build"] --> verify["verify"]
```

- **paper-design-system** builds the system once from your brand and code:
  tokens mirrored from the theme file, a Foundations page, a Components page
  with one `Component / <Name>` card per shadcn component, and an agent-ready
  `DESIGN.md` that holds the visual system only, checked by
  `scripts/check-design-md.ts`. Rerun it to sync after code or brand changes.
- **paper-design** designs or refines screens from the decisions and journeys,
  every device and state in scope, composed from a Paper library that mirrors
  your code components and tokens. It reviews usability by severity and
  checks the boards for literal values and the design rules before you review
  them.
- **paper-handoff** names and archives the boards, runs the readiness gates
  (devices, states, components, tokens, design rules, behaviour, reach, open
  questions), and writes a `docs/design/handoff/<page>.json` file and a Ready
  for build card for each design page, so each page ships when it is ready.

## Design rules

`DESIGN.md` carries the rules every design and build agent follows, seeded
from the [baseline craft rules](skills/paper-design-system/references/craft-rules.md)
(matching controls side by side, square icon buttons, 44px phone targets and
more). Each rule names its check: the Paper lint before review and handoff,
the verify skill's layout audit in the browser, or a shared code component.
When you correct the same detail twice, add it as a rule.

## Install

Install the core skills first, then add these beside them:

```sh
cp -R agentic-skills/extensions/paper/skills/* .claude/skills/
```

They need Paper Desktop with its MCP server connected to your agent. Then ask
*"Design the enrolment screen in Paper"* or *"The Admissions designs are final,
prepare the handoff"*.

## Start with the design system

Run *"Set up our design system in Paper"* first. The other two skills rely on
what it builds: Paper tokens named and valued like your theme, a Components
page named like your code, and `DESIGN.md`. See the
[canvas conventions](skills/paper-design/references/paper-canvas.md).

## Evaluating

Each skill has `evals/trigger-queries.json` for the description optimiser,
described in [evaluating the skills](../../docs/evaluating-skills.md).
paper-handoff (a set with planted gaps, a complete set), paper-design (a
refinement) and paper-design-system (a sync that clears business rules out of
`DESIGN.md`) also have behaviour cases. They run on a synthetic Paper export,
so they test judgement, not canvas edits.
