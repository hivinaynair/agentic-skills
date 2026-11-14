---
name: paper-handoff
description: "Finalise approved Paper designs for build: name and archive boards, run the readiness gates, and write a handoff file and Ready for build card for each design page. Use when the owner says the Paper designs are final or asks to prepare a Paper handoff."
compatibility: "Part of the Paper extension. Needs the core verify skill installed beside it (its handoff format and checker), the paper-design skill and Paper's MCP server."
---

# Paper handoff

Turn the approved boards into handoffs the build agent can follow without the
design chat: one per Paper design page, each a handoff file in the repository,
in the format of the verify skill's `references/design-coverage.md`, and a
feature scope manifest linking every handoff to the source inventory. Add a
Ready for build card on each page. Load the Paper guide with
`get_guide` (`paper-mcp-instructions`) before reading or editing the file, and
follow the [canvas conventions](../paper-design/references/paper-canvas.md).

## Confirm the scope

From the owner's direction and the design conversation, identify the feature,
its design pages and the approved boards on each. Design pages exclude
`Foundations`, `Components`, `Reference ·` and `Archive ·` pages. Each design
page gets its own handoff, gated and marked ready on its own; a request for a
whole feature produces one per page. A board is handed off with the page it
sits on: move a board that belongs to another page's flow before handing off,
and keep a board shared by several pages on the one page that owns it.

Start from the design inventory and required states, not a selected handful of
boards. Read every scoped page completely, using the tree or paged reads when a
listing is truncated. Reconcile board IDs and exclusions before freezing the scope.

Take the required devices from accepted decisions or project rules before
checking which boards exist. Tell apart variants and states that ship. When
approval or a choice between variants is unclear, ask about that gap and keep
going on the confirmed parts. An owner answer that settles behaviour, devices
or scope goes to the decision record through the decide workflow, never into
the handoff.

## Finalise the boards

Rename each approved board in place to the canvas naming. Move clearly
superseded boards in scope to an `Archive · Feature` page in the same file,
keeping the original nodes. Flag any uncertain board that could pass for
approved. Treat permanent deletion as a separate, explicit request.

## Run the gates

Each gate passes, or its failure becomes a listed gap. A gate passes only for
boards you have read: a board whose layers or styles you could not read is a
gap under every gate that needs them, never a pass.

1. **Devices.** Every required screen/state has a board on each required device,
   or an explicitly approved device exclusion.
2. **States.** Each board shows one state. Every screen that loads data has a
   loading board paired with its loaded board.
3. **Components.** Every control is a named library clone, and every library
   component on any approved board (dialogs and sheets included) maps to a
   host component as `reuse`, `restyle` or `new`. Paper links clones by layer
   name only, so names match the library exactly.
4. **Tokens.** The lint finds no literal value where a token exists. Each
   remaining literal or proposed token goes in `exceptions` only once the owner
   approves it; until then it is a gap that names the proposal.
5. **Rules.** The rule checks in the canvas conventions pass on every board:
   matching controls side by side, square icon buttons, phone targets and the
   other `Do's and Don'ts` of `DESIGN.md`. Each failure is a gap naming the
   rule.
6. **Behaviour.** Every board traces to journey criteria, and every depicted
   field or action to the model or an accepted decision.
7. **Reach.** Every board has a route and a setup a script or seed can
   reproduce, and date-dependent states share one fixed clock.
8. **Questions.** No open comment thread or open decision question touches a
   board in scope.

## Write the handoff

For each design page, write a handoff file at the host's design records path,
by default `docs/design/handoff/<page-slug>.json` (`New booking` becomes
`new-booking.json`). It names the `feature` and `page`, links the page as
`designSource`, and lists that page's approved boards, the device viewports,
clock, the components those boards use and their exceptions. Set `status` to
`ready`, or to `draft` with every failed gate in `gaps`. The file holds only
the format's fields. For each board, cache its JSX, relevant computed styles and
tokens in a design export and save a PNG reference at the intended capture size.
Record its stable ID, screen/state and reference SHA-256. Reuse unchanged exports
and captures; refresh only changed boards. A page link alone is not a baseline.

Write `<feature>-scope.json` linking every page handoff and the independent source
inventory, including its required states and approved exclusions. Run from verify:

```sh
bun scripts/check-design-coverage.ts <scope file> --inventory-only
bun scripts/check-design-coverage.ts <scope file> --ready
```

On each design page, create or update one `Ready for build · <Page>` board
beside its approved boards, with editable text grouped by journey stage:

- **Scope.** The page, required devices, any device a decision excludes (with
  its ID), the handoff and scope manifest paths, and included board count.
- **Behaviour the canvas cannot show.** Scrolling, focus, transitions, and where
  a drawer returns on close, each with its decision or journey IDs. Keep
  behaviour changes apart from presentation changes. Write each into the
  board's `notes` in the handoff file too, so it lives with the feature rather
  than in `DESIGN.md`.
- **Gaps.** Every failed gate.

With any gap, title the card `Handoff draft · <Page>`. Reuse each page's
existing card and file on reruns. When an older handoff covers several pages,
split it into one file per page and delete the combined file once every page
has its own.

## Check and return

Read the names, cards and handoff files back. Each approved board appears in
exactly one file, its page's, and resolves there; superseded boards sit in the
archive; every inventory entry is included or explicitly excluded, and both scope
checks pass before claiming ready. Draft inventories can be checked but cannot
establish completion. Screenshot each changed card for legibility and
clipping, then call `finish_working_on_nodes`.

Return one line per page: its Paper link, handoff file path, ready or draft,
approved and archived board counts, and the gaps the builder should know. If Paper edits could not be
made, return a draft and say which edits are pending.
