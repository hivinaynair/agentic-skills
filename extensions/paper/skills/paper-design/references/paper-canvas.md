# Paper canvas conventions

These keep a Paper file readable by the agent that builds from it. Paper's MCP
export reads layer names and styles, so the canvas carries the component map
and the tokens the build will use. Paper has no component instances, theme
modes or CSS grid yet; the conventions below stand in for them.

## Working with the MCP

- Orient cheaply: `get_basic_info` with an explicit `pageId`, then
  `get_tree_summary` before `get_jsx`. Call `get_font_family_info` before the
  first typography change.
- Take exact values from `get_jsx`, `get_computed_styles` and `get_tokens`.
  Screenshots are for visual review only.
- Paper plans meter MCP calls. Reuse nodes with `duplicate_nodes` or
  `<x-paper-clone>` and edit them with `update_styles` and `set_text_content`
  instead of rewriting HTML.
- Finish with `finish_working_on_nodes`, passing the boards you edited.

## Tokens mirror the code

The code's theme file is the source of truth. Name Paper tokens after the
Tailwind theme variables the utilities come from (`--color-primary` for
`bg-primary`, `--radius-lg`, `--spacing-control`), with the values the theme
resolves them to. Compare with `get_tokens` (`format: "tailwind"` against the
theme's `@theme`, `"css"` against `:root`) and fix Paper to match with
`set_tokens` and `create_tokens`. Report each value the design needs that the
code lacks as a proposed new token, and carry it into the handoff
`exceptions`. Before deleting a token, find its users with `find_nodes` and
rebind them.

## A library mirrors the code components

The [paper-design-system](../../paper-design-system/SKILL.md) skill builds the
`Components` page: one `Component / <Name>` card per code component, named as
the code exports it, with specimens named `<Name> · <variant> · <size> ·
<state>`. A component the design needs that the code lacks gets a
`New · <Name>` card.

Compose screens by cloning specimens with `<x-paper-clone node-id="…">`, then
edit text and content. Keep each clone's layer name: the build reads the name
to find the component. Name every region frame for what it is (`Filter bar`,
`Worklist row`, `Summary card`). A control on a board is always a named clone.
Clones are copies, so a library change does not reach them; after one, find
the affected clones with `find_nodes` and re-clone them.

Paper lays out with flex only. Draw tables and grids as flex rows named for
the host component they stand for (`Table`, `Table row`), so the build maps
them to that component instead of copying the structure.

## Boards and pages

Name each design board `Feature · Screen · Device · State`, for example
`Admissions · Enroll · Desktop · New customer`. Paper truncates names over 50
characters: shorten the feature or screen and keep device and state whole. A
board shows one state. Desktop boards use the host's desktop width (default
1440×900) and Phone boards 390×844, with `height: "fit-content"` where content
runs long.

`get_basic_info` lists only the first 100 boards of a page, so keep pages
small: one journey stage or area per page, around 40 boards. Put research,
flow maps and captures of the built app on their own pages, named
`Reference · <Feature>`, with boards named `Reference · <Feature> · <what>`.
Paper Snapshot captures the running app as editable layers.

## Lint before review

For every changed board, read `get_jsx` with `format: "tailwind"` and
`includeNodeIds: false`. Look for colours, spacing, sizes, radii and type set as
literals (`[10px]`, `#1a1a1a`, `rgb(…)`, `style={{…}}` fallbacks) where a token
exists, and for controls drawn as plain frames or rectangles. For file-wide
sweeps, `find_nodes` with a literal colour or size is cheaper. Rebind each
literal to its token or record it as a proposed exception, and replace each
drawn control with its library clone. A board you have not read is unlinted:
report it as such, never as clean.

## Comments carry open questions

Paper comment threads are the owner's channel on the canvas. Read open threads
on the scoped pages with `list_comment_threads`, paging with `limit` and
`offset` past 50; treat each as feedback or a question. When a change fully
addresses one, mark it resolved with `set_comment_thread_status`. An open
thread at handoff is a gap.
