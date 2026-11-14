# Baseline craft rules

Rules that hold in any product, so the owner never has to say them. The
paper-design-system skill writes them into the `Do's and Don'ts` of
`DESIGN.md` with the product's values filled in, and every design and build
agent follows them from there. The owner may change a value or drop a rule;
record why beside it.

Each rule names its check. A rule with no check gets skipped, so add a rule
only with one:

- **Paper:** the lint in the [canvas conventions](../../paper-design/references/paper-canvas.md),
  run by paper-design before review and by paper-handoff as a gate.
- **Browser:** the verify skill's layout audit, run on the built screen.
- **Code:** a shared component enforces it, so a builder cannot get it wrong.
  Prefer this where the host has or can add such a component.

| Area | Rule | Checked in |
|---|---|---|
| Sizing | Controls side by side share one size: height, padding, type size and radius. | Paper, browser, code (an action row or dialog footer sets one size) |
| Sizing | One control height per device; inputs, selects and buttons in one row match it. | Paper, browser |
| Sizing | Icon-only buttons are square at the control height. | Paper, browser |
| Alignment | Items in a row share one centre line; text in a row shares a baseline. | Paper, browser |
| Alignment | Content hangs off a few shared edges; no near-misses of 2–4px. | Paper |
| Hierarchy | One primary action per screen or dialog; the others are outline or ghost. | Paper |
| Hierarchy | Actions sit in one order everywhere (for example, primary last) and on one side. | Paper, code |
| Hierarchy | Destructive styling only on the action that confirms the destruction. | Paper |
| Spacing | Spacing uses scale steps only; gaps inside a group are smaller than gaps between groups. | Paper |
| Type | At most four type sizes per screen; sentence case for labels and buttons. | Paper |
| Tables | Numbers right-aligned in tabular figures; row actions in a fixed-width slot. | Paper, browser (alignment) |
| Forms | A visible label above each field, one column, errors under their field, actions aligned to the form's edge. | Paper |
| Touch | Phone targets are at least 44px and at least 8px apart. | Paper, browser |
| Access | Text and controls meet WCAG AA contrast; status is text, never colour alone; focus is visible. | Paper, browser |
| States | A loading skeleton keeps its loaded layout's geometry. | Paper, browser |

When the owner corrects the same visual detail twice, it is a missing rule:
add it here if it would hold in any product, or to the product's `DESIGN.md`
if it holds only there, with its check.
