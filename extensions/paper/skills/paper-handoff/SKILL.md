---
name: paper-handoff
description: "Finalise approved Paper designs for build: name and archive boards, run the readiness gates, write the handoff file and the Ready for build card. Use when the owner says the Paper designs are final or asks to prepare a Paper handoff."
compatibility: "Part of the Paper extension. Needs the core verify skill installed beside it (its handoff format and checker), the paper-design skill and Paper's MCP server."
---

# Paper handoff

Turn the approved boards into one handoff the build agent can follow without the
design chat: the handoff file in the repository, in the format of the verify
skill's `references/design-coverage.md`, and a Ready for build card in Paper. Load the Paper guide with
`get_guide` (`paper-mcp-instructions`) before reading or editing the file, and
follow the [canvas conventions](../paper-design/references/paper-canvas.md).

## Confirm the scope

From the owner's direction and the design conversation, identify the feature,
its Paper pages and the approved boards. Take the required devices from the
owner or project rules before checking which boards exist. Tell apart
variants and states that ship. When approval or a choice between variants is
unclear, ask about that gap and keep going on the confirmed parts.

## Finalise the boards

Rename each approved board in place to the canvas naming. Move clearly
superseded boards in scope to an `Archive · Feature` page in the same file,
keeping the original nodes. Flag any uncertain board that could pass for
approved. Treat permanent deletion as a separate, explicit request.

## Run the gates

Each gate passes, or its failure becomes a listed gap. A gate passes only for
boards you have read: a board whose layers or styles you could not read is a
gap under every gate that needs them, never a pass.

1. **Devices.** Every screen has a board on each required device.
2. **States.** Each board shows one state. Every screen that loads data has a
   loading board paired with its loaded board.
3. **Components.** Every control is a named library clone, and every library
   component on any approved board (dialogs and sheets included) maps to a
   host component as `reuse`, `restyle` or `new`. Paper links clones by layer
   name only, so names match the library exactly.
4. **Tokens.** The lint finds no literal value where a token exists. Each
   remaining literal or proposed token goes in `exceptions` only once the owner
   approves it; until then it is a gap that names the proposal.
5. **Behaviour.** Every board traces to journey criteria, and every depicted
   field or action to the model or an accepted decision.
6. **Reach.** Every board has a route and a setup a script or seed can
   reproduce, and date-dependent states share one fixed clock.
7. **Questions.** No open comment thread or open decision question touches a
   board in scope.

## Write the handoff

Write the handoff file at the host's design records path, by default
`docs/design/handoff/<feature>.json`, with every approved board, the device
viewports, clock, component map and exceptions. Run the inventory check from
the verify skill's directory:

```sh
bun scripts/check-design-coverage.ts <handoff file> --inventory-only
```

Create or update one `Ready for build · Feature` board beside the approved
boards on the primary page, with editable text grouped by journey stage:

- **Scope.** Pages, required devices, any device the owner excluded, and the
  handoff file path.
- **Behaviour the canvas cannot show.** Scrolling, focus, transitions, and where
  a drawer returns on close, each with its decision or journey IDs. Keep
  behaviour changes apart from presentation changes. Write each into the
  board's `notes` in the handoff file too, so it lives with the feature rather
  than in `DESIGN.md`.
- **Gaps.** Every failed gate.

With any gap, title the card `Handoff draft · Feature`. Reuse the existing card
and file for the same scope on reruns.

## Check and return

Read the names, card and handoff file back. Each approved board appears once,
resolves on its page and in the file; superseded boards sit in the archive; the
inventory check passes. Screenshot the card for legibility and clipping, then
call `finish_working_on_nodes`.

Return the Paper link, the handoff file path, approved and archived board
counts, and the gaps the builder should know. If Paper edits could not be
made, return a draft and say which edits are pending.
