---
name: paper-handoff
description: Finalize approved Paper designs for implementation. Use when the user says the designs are final or asks to prepare a Paper handoff. Rename the approved artboards and write the Ready for build card in Paper.
---

# Paper handoff

Turn the final designs into one handoff an implementation agent can use without
the design chat. Work in Paper. When using Paper MCP, load its guide before
inspecting or editing the file.

## Confirm the scope

Use the user's direction and the design conversation to identify the feature,
primary Paper page, related pages, and approved artboards. Inspect those pages
in Paper. Distinguish design variants from states that should ship. When
approval or a choice between conflicting variants is unclear, ask about the
specific gap and keep going on the confirmed parts.

## Finalize the artboards

Rename each approved artboard in place, preserving its artwork and identity.
Use a unique name within the handoff in the form
`Feature · Stage or screen · Device · State`. For example,
`Admissions · Details & Docs · Desktop · Populated`. Paper's rename tool
truncates names over 50 characters. Shorten feature or stage labels deliberately
so the device and state still fit, and keep the full labels in the coverage
notes. Drop qualifiers like `Improved` and use an actual state such as
`Loading`, `Empty`, `No results`, or `Drawer open`. Include a meaningful variant
in the state name if needed to distinguish two final boards.

Move clearly superseded artboards from the agreed scope to an
`Archive · Feature` page in the same Paper file. Create or reuse that page only
when there are boards to move. Move the original nodes to the archive page root
so they retain their identity. Establish which boards were replaced from the
design conversation or explicit markings. Flag any uncertain boards that could
be mistaken for approved designs. Treat permanent deletion as a separate,
explicit request.

## Write the handoff card

Create or update one `Ready for build · Feature` artboard beside the approved
designs on the primary Paper page. Use editable text layers and readable
grouping. For large sets, group entries by stage or journey within the card.

- **Scope.** Name what the complete handoff covers. Point to relevant shared
  components or tokens and record any approved visual exceptions.
- **Coverage.** List every approved artboard by its exact name. For each, record
  its Paper page link if different, app route or entry point, verification viewport,
  test role and fixture or steps that reach the state, and the visual details
  the browser review should check. Share common setup across entries. Use the
  approved viewport for fit-content artboards and flag it if unspecified.
- **Interactions.** Describe relevant behavior the canvas cannot show, such as
  scrolling, focus, loading transitions, or where a drawer returns on close.
  Identify intended behavior changes separately from presentation changes and
  link approved decisions or journeys where available. Flag unresolved rules
  or unconfirmed reproduction steps explicitly.

Keep unresolved designs out of the approved list. If the approved scope itself
cannot be established, label the card `Handoff draft · Feature` and list the
blocking questions. Reuse the existing card for the same scope on reruns.

## Check and return

Read the Paper names and card back after editing. Check that each approved board
appears exactly once and resolves on its referenced page, and that superseded
boards moved to the archive. Inspect a screenshot of the card to check legibility
and clipping. Finish the Paper editing session using the tool's completion action
when available.

Return the Paper page link, the approved and archived artboard counts, and any
gaps the implementer should know about. If Paper edits could not be made, return
a draft and say which edits are pending. End with the handoff for the entire
approved set.
