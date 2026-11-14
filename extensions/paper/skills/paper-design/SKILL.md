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

1. **Design skill first.** When the project's `AGENTS.md` (or equivalent) names
   a design skill, such as Impeccable, load it with the mode and context files
   it names before any Paper call, and use it for the design and review below.
   Done when it is loaded, or when the project names none.
2. Load the Paper guide with `get_guide` (`paper-mcp-instructions`), then
   `get_basic_info` for the file and the scoped pages. The host's design system
   (`DESIGN.md` or its equivalent) is the brief: its tokens, type, components
   and tone replace the guide's new-design brief, mood and palette steps.
3. Read the journey index and the journeys in scope, then trace their rules and
   open questions in the decision record. Accepted decisions say what happens;
   journeys say what each person sees and does. Current screens and older
   boards are evidence.
4. Read the [canvas conventions](references/paper-canvas.md). Check that
   the tokens and library components used in scope mirror the code; resolve drift
   before approval. Keep unrelated library work outside this task.
   With no library page or no `DESIGN.md`, run the
   [paper-design-system](../paper-design-system/SKILL.md) skill before
   designing screens.

Keep a small source inventory alongside the design records: required screen/state
pairs from the journeys, required devices, and each board's stable ID, screen, state
and device. List exclusions with their approved reason. Reconcile all scoped pages
against it, including boards missing on every device; a truncated canvas listing
is not the inventory. Done when every required state has a board or a named gap.

## Ask only what matters

Answer what you can from the records. Ask the owner, in one message, when the
target is unclear or a missing or conflicting rule changes the flow,
permissions, money, data or the meaning of a status. Cite the IDs, recommend an
answer and say what each answer changes. Keep going on the confirmed parts.
Gaps in behaviour go through the project's decide or journeys workflow; mark
boards that depend on an open answer as drafts.

Record what the owner settles where it belongs: behaviour as decisions or
journey criteria, visual detail on the board and its usage line, and
interaction a board cannot show in the handoff notes. Only a visual rule that
changes every feature goes into `DESIGN.md`, through the paper-design-system
skill; business rules never do.

## Design

Compose from the library page and the host's existing layouts and terms. For a
refinement, keep existing steps and states unless the scope changes them, and
edit boards in place.

- **The system's rules first.** Follow every rule in the `Do's and Don'ts` of
  `DESIGN.md` without being asked: matching sizes for controls side by side,
  one centre line per row, square icon buttons, phone targets of 44px and the
  rest. The owner should never have to point one out.
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
consistency. Run the lint and the rule checks from the canvas conventions on
every changed board. Fix the blocking and major
issues together, then confirm them in one final pass. Call
`finish_working_on_nodes` when you are done editing.

Before approval, reconcile the inventory with the finished boards. Resolve conflicts
with the host system now: approved composition, type, spacing and responsive layout
will be the build's visual target. The builder may reuse code, but may not substitute
a different layout or silently round values.

Return the Paper link, the design skill you used, what changed on each device,
the decision and journey IDs, open questions and any missing states. Once the owner approves the designs
for build, run the [paper-handoff](../paper-handoff/SKILL.md) skill; when the
request already includes finalising, run it in the same pass. Code starts with a
separate build request.
