---
name: paper-design
description: "Design or refine product screens in Paper from approved decisions and journeys, so the build can follow them without the design chat. Use when asked to design, redesign, refine or polish a screen or flow in Paper, or to fix a Paper design."
compatibility: "Part of the Paper extension. Reads the core decide and journeys records; needs Paper's MCP server."
---

# Paper design

**For the owner:** you answer only questions that change the flow, permissions,
money, data or what a status means. You get Paper boards for every device and
state in scope, each traced to its journey, ready to approve for handoff.

The product is meant to be simple for the people who use it every day. Every
screen gets one clear job, a familiar layout, and a visible next step.

## Load the context

1. Load the Paper guide with `get_guide` (`paper-mcp-instructions`), then
   `get_basic_info` for the file and the scoped pages. The host's design system
   (`DESIGN.md` or its equivalent) is the brief: its tokens, type, components
   and tone replace the guide's new-design brief, mood and palette steps.
   Load the host's design skill too, such as Impeccable, if installed.
2. Read the journey index and the journeys in scope, then trace their rules and
   open questions in the decision record. Accepted decisions say what happens;
   journeys say what each person sees and does. Current screens and older
   boards are evidence.
3. Read the [canvas conventions](references/paper-canvas.md). Check that
   Paper's tokens and library page mirror the code, and fix the drift first.
   With no library page or no `DESIGN.md`, run the
   [paper-design-system](../paper-design-system/SKILL.md) skill before
   designing screens.

Write a short working note: the actor, their task, the decision and journey IDs,
and the screens, devices and states in scope. Done when every state in scope
traces to a journey step or a failure path.

## Ask only what matters

Answer what you can from the records. Ask the owner, in one message, when the
target is unclear or a missing or conflicting rule changes the flow,
permissions, money, data or the meaning of a status. Cite the IDs, recommend an
answer and say what each answer changes. Keep going on the confirmed parts.
Gaps in behaviour go through the project's decide or journeys workflow; mark
boards that depend on an open answer as drafts.

Record what the owner settles where it belongs: behaviour as decisions or
journey criteria, visual detail on the board and its usage line, and
interaction a board cannot show in the handoff notes. Only a rule that changes
every feature goes into `DESIGN.md`, through the paper-design-system skill.

## Design

Compose from the library page and the host's existing layouts and terms. For a
refinement, keep existing steps and states unless the scope changes them, and
edit boards in place.

- **One job per screen.** One primary action, named with a verb and noun. Group
  secondary actions out of the main path.
- **Recognition over recall.** Visible field labels, plain words the actor uses,
  sensible defaults, and status shown as text with any colour or icon.
- **Every outcome visible.** What is saved, pending or failed, and what to do
  next. Entered work survives an error, and every failure path has a recovery.
- **Every state, every device.** For each screen, design Desktop and Phone
  together unless the user narrows the devices. Cover the empty, loading, error,
  denied and recovery states the journeys name, one state per board. Pair each
  loading board with its loaded layout.
- **Traceable content.** Every field, action and status maps to the existing
  model or an accepted decision. Mark anything else as new behaviour and raise it
  before handoff.
- **Seedable data.** Use one realistic dataset with an explicit business date,
  taken from the host's seed or fixtures, so each state can be reproduced.
  Rows the seed lacks are proposed fixture additions, listed as such in your
  return.

## Review

Screenshot the affected boards in one batch. Walk the task as the actor: can they
tell where they are, what needs attention and what to do next, and recover from a
failure without guessing? Check that every board on the scoped pages, existing
ones included, shows one state. Rate each usability issue by severity, from
cosmetic to blocking, and check hierarchy, type, spacing, alignment, contrast and control
consistency. Run the lint from the canvas conventions. Fix the blocking and major
issues together, then confirm them in one final pass. Call
`finish_working_on_nodes` when you are done editing.

Return the Paper link, what changed on each device, the decision and journey
IDs, open questions and any missing states. Once the owner approves the designs
for build, run the [paper-handoff](../paper-handoff/SKILL.md) skill; when the
request already includes finalising, run it in the same pass. Code starts with a
separate build request.
