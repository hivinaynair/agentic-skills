# Agent-ready DESIGN.md

Follows the [DESIGN.md format](https://github.com/google-labs-code/design.md):
YAML front matter for tokens, then prose sections in a fixed order. Agents read
the front matter as rules and the prose as the reasons. Keep the names
identical to the code's tokens and components so nothing needs translating.

```markdown
---
name: Brightline
colors:
  background: "oklch(98.5% 0.004 90)"
  foreground: "oklch(21% 0.006 90)"
  primary: "oklch(42% 0.09 250)"
  muted-foreground: "oklch(48% 0.01 90)"
typography:
  body: { fontFamily: Inter, fontSize: 16px, fontWeight: 400, lineHeight: 24px }
rounded:
  lg: 8px
spacing:
  control: 32px
  control-phone: 44px
---

## Overview
## Colors
## Typography
## Layout
## Elevation & Depth
## Shapes
## Components
## Do's and Don'ts
```

What each section must carry for agents:

- **Overview:** one line pointing to `PRODUCT.md` for the product and its
  users, the devices and visual tone that follow from them, and the
  source-of-truth table.
- **Colors, Typography, Shapes:** a row per token: token, utility, when to use,
  never use for. State surprises plainly, such as a remapped `text-sm`. Status
  colours are tones (`success`, `warning`, `destructive`, `info`); which
  domain status takes which tone is a feature decision, not a row here.
- **Layout:** container widths, page header anatomy, spacing rhythm and control
  heights per device, each as a utility or token.
- **Components:** the inventory, one row per component: name, code path, Paper
  card, variants and sizes, and when to pick it over its neighbours. New
  screens compose these; a new component is added to code before screens use
  it.
- **Do's and Don'ts:** checkable rules, one table row each with its check:
  the [baseline craft rules](craft-rules.md) with the product's values filled
  in, then no literal values or palette classes and the shared empty, loading,
  error and denied states.
- **Copy:** voice, casing, punctuation, and how labels, buttons and errors
  are phrased. Domain terms and their meanings live in `PRODUCT.md` or the
  project's glossary.
- **Known deviations:** dated notes on anything in code that does not yet
  follow this file, so agents do not copy it.

## What stays out

The file is a visual system brief, read in full by every design and build
agent. Each line should hold for any screen in the product, and none should
say what the product does or allows. It names no decision or journey IDs.

| Content | Its home |
|---|---|
| Business logic: who may do what, what counts as paid or overdue, limits, validation and formats, what a domain status means, tax and money rules | The decision record and journeys |
| Product description, users, domain terms | `PRODUCT.md` or the project glossary |
| Demo data, seed commands, sign-ins, the business date | `AGENTS.md` or the feature's handoff setup |
| A rule for one screen, flow or fixture (a catalogue list height, a payment summary layout) | The feature's journeys, decisions and Paper boards |
| Interaction a board cannot show (reveal and focus, sticky footers, scroll behaviour) for one feature | That feature's handoff notes, with decision or journey IDs |
| Past experiments, superseded proposals, change history | A design archive |

The test for a line is whether removing it would change a screen in another
feature, and whether it would still be true if the business rules changed. If
either answer is no, the line belongs in another record.
