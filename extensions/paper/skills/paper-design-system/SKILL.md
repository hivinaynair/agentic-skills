---
name: paper-design-system
description: "Build or update a product's design system in Paper from its brand identity and its Tailwind and shadcn/ui code: tokens, a foundations page, a components page that mirrors the code, and the DESIGN.md agents design and build from. Use when asked to set up, create, extend, sync or audit a design system, style guide, component library or design tokens in Paper."
compatibility: "Part of the Paper extension. Needs Paper's MCP server; works best with a Tailwind v4 + shadcn/ui codebase and the shadcn MCP or skill installed."
---

# Paper design system

**For the owner:** you give the brand once (name, logo, colours, type, voice,
audience and any references you like) and approve the foundations before the
components are drawn. You get a Paper file whose tokens and components match
the code by name, and a `DESIGN.md` every design and build agent reads first.

## Who owns what

| Concern | Source of truth | Mirrors |
|---|---|---|
| Token values | The code's theme file (`globals.css` or equivalent) | Paper tokens, `DESIGN.md` front matter |
| Usage rules | `DESIGN.md` prose | Usage lines on the Paper cards |
| Component anatomy and variants | The code components | Paper component cards |
| Product policy | The decision record | Nothing here |
| New compositions not yet in code | Paper, until a handoff builds them | `DESIGN.md` inventory as `New` |

Keep each fact in its source and copy it outward. A mirror that disagrees with
its source is drift to fix, never a second opinion.

## 1. Gather

Load the Paper guide with `get_guide` (`paper-mcp-instructions`), then
`get_basic_info` for the file. Read `PRODUCT.md` for the audience and tone,
any existing `DESIGN.md`, the theme file, `components.json` and the component
folder. When the shadcn MCP or skill is installed, use it to list the installed
components, style and registries. Ask the owner, in one message, only for the
brand inputs you could not find.

Done when you can list the brand inputs, the code's tokens and every installed
component with its variants.

## 2. Foundations

Settle the token set in the code's names: shadcn's semantic colours
(`background`, `foreground`, `primary`, `muted-foreground`, `border`, `ring`,
plus status colours the product needs), one `radius` base, a type scale, a
spacing scale, control heights per device, container widths and breakpoints.
Use one colour format. Check every foreground against its background at WCAG
AA. Derive brand choices from the inputs; for a refresh, change only what the
brief asks.

Show the owner the proposed values and the contrast results and wait for
approval. Then write the approved values into the theme file (values and new
token names only), and mirror them into Paper with `create_tokens` and
`set_tokens`, named after the Tailwind theme variables the utilities come from
(`--color-primary` for `bg-primary`, `--radius-lg`, `--text-base`). Add a
`description` to tokens whose use is not obvious. Paper has no modes: design in
the primary mode and keep any other mode as a `--color-dark-*` reference set
that boards do not use.

Draw a `Foundations` page with one board each for colour, type, space and
shape, and controls. Each swatch or specimen carries its token name and a
one-line rule for when to use it.

## 3. Components

Draw a `Components` page with one board per category (Forms, Navigation,
Surfaces and overlays, Data and feedback, Layout and media, then
product-specific groups). Give every installed component one card:

- a frame named `Component / <Name>`, where `<Name>` is the code's export
  (`Checkbox`, `DropdownMenu`), with a heading naming its code path;
- one specimen frame per variant, size and state the code defines, named
  `<Name> · <variant> · <size> · <state>`, built from tokens only;
- one usage line: when to use it, and the rule people break.

Show the states the product needs: default, focus, disabled, error, selected,
loading. Put product compositions that combine components (an offering row, a
receipt card) on a `Patterns` board as `Pattern / <Name>` cards, each naming
its code path or marked `New`. Put shared empty, loading, error, denied and
success states on a `States` board.

When the app has a component gallery route, capturing it with Paper Snapshot
is a fast start; rename the captured layers to this naming afterwards.

Done when every installed component has a card, every card maps to code or is
marked `New`, and the lint in the [canvas conventions](../paper-design/references/paper-canvas.md)
finds no literal values.

## 4. DESIGN.md

Write or update `DESIGN.md` in the [agent-ready format](references/design-md.md):
token front matter named as in code, then the rules agents need most. Tokens
are normative and prose gives context. When the `@google/design.md` CLI is
available, run its `lint`.

## 5. Check and return

Compare the theme file, Paper's tokens and the `DESIGN.md` front matter; all
three agree. Screenshot each page and review consistency across components:
heights, radii, focus rings, label placement. Call `finish_working_on_nodes`
with the boards you edited.

Return the Paper links, the token changes made in code, components covered and
missing, the `DESIGN.md` path, and open questions. On a rerun, sync instead of
rebuilding: add cards for new components, update changed tokens, and list
screens elsewhere in the file whose clones predate a library change (clones are
copies, so they do not update themselves).
