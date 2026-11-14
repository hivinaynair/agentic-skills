# Design coverage

The **handoff file** is the contract between the approved designs and the build.
The design handoff writes it, the build reads it, and verify checks the result
against it. One file covers one design page or section, so each can be marked
ready on its own. Keep it in the host repository, by default at
`docs/design/handoff/<page>.json`. When the handoff has none, reconcile the
approved designs and the notes into one before editing the app. Keep the board
list fixed through retries. For a request to verify a subset, record its scope
explicitly.

## Complete scope

Keep a feature/release manifest linking all page handoffs to a separate source
inventory, captured from the complete design listing before building:

```json
{
  "feature": "Account",
  "requiredDevices": ["Desktop", "Phone"],
  "inventory": "account-inventory.json",
  "handoffs": ["account-settings.json"]
}
```

The source inventory records required states from journeys even when no board exists:

```json
{
  "requiredStates": [{ "screen": "Account settings", "state": "Loaded" }],
  "artboards": [
    { "id": "file/page/desktop", "screen": "Account settings", "state": "Loaded", "device": "Desktop" },
    { "id": "file/page/phone", "screen": "Account settings", "state": "Loaded", "device": "Phone" }
  ],
  "excluded": [],
  "deviceExclusions": []
}
```

Every source ID belongs to exactly one handoff, or an `excluded` entry with `id`
and the owner's approved `reason`. Each required screen/state needs every required
device, unless `deviceExclusions` names its `screen`, `state`, `device` and approved
`reason`. These exclusions are inherited by page handoffs during a scope check.
Paths are relative to their containing file. A page check alone never establishes
feature completeness. Review the inventory against the request: the checker cannot
discover goals absent from both journeys and inventory. Freeze inputs during retries.

## Page handoff

```json
{
  "feature": "Account",
  "page": "Account settings",
  "designSource": "https://example.test/design/account-settings",
  "status": "draft",
  "gaps": ["No Phone board for the Loading state"],
  "requiredDevices": ["Desktop", "Phone"],
  "viewports": { "Desktop": "1440x900", "Phone": "390x844" },
  "clock": "2026-11-10T09:30:00+05:30",
  "components": [
    { "design": "Button · primary", "code": "src/components/ui/button.tsx", "use": "reuse" },
    { "design": "Plan card", "code": "src/features/billing/plan-card.tsx", "use": "restyle" },
    { "design": "New · Usage meter", "use": "new" }
  ],
  "exceptions": [
    { "id": "E1", "artboards": ["Account settings · Phone · Loaded"], "detail": "Keeps the native date input" }
  ],
  "artboards": [
    {
      "id": "file/page/desktop",
      "name": "Account settings · Desktop · Loaded",
      "screen": "Account settings",
      "state": "Loaded",
      "device": "Desktop",
      "route": "/settings/account",
      "setup": "bun run seed:demo; sign in as owner@demo.test",
      "criteria": ["J4.S1.c1"],
      "designScreenshot": "references/account-desktop.png",
      "designHash": "<sha256 of the reference PNG>",
      "designExport": "references/account-desktop.json",
      "notes": ["Saving keeps focus on the edited field (J4.S1.c3)"]
    },
    {
      "id": "file/page/desktop-loading",
      "name": "Account settings · Desktop · Loading",
      "screen": "Account settings",
      "state": "Loading",
      "device": "Desktop",
      "route": "/settings/account",
      "setup": "Throttle the account request",
      "loadingFor": "Account settings · Desktop · Loaded"
    },
    {
      "id": "file/page/phone",
      "name": "Account settings · Phone · Loaded",
      "screen": "Account settings",
      "state": "Loaded",
      "device": "Phone",
      "route": "/settings/account",
      "setup": "bun run seed:demo; sign in as owner@demo.test",
      "criteria": ["J4.S1.c1"]
    }
  ]
}
```

- `page` names the design page and `designSource` links it. `status` is
  `ready`, or `draft` with each unmet readiness check in `gaps`; a draft is
  built only with the owner's go-ahead, and its gaps stay open.
- The file holds only the fields shown here. Owner answers, device policy and
  other decisions belong in the decision record; the checker rejects any other
  field.
- `requiredDevices` comes from the approved scope and project rules. Each
  device needs at least one board. `viewports` gives the browser size per device;
  without one, use 1440x900 for Desktop and 390x844 for Phone.
- Each board names one state, its `device`, the `route` that reaches it and the
  `setup` that produces it: a seed command, fixture or the real user actions.
  `clock` fixes the business date for date-dependent states.
- `components` maps each design component to host code: `reuse` it as is,
  `restyle` the existing component, or build a `new` one. Unlisted regions use
  the host's existing components and tokens.
- `exceptions` lists approved departures from the design or the host system: a
  kept host control, a literal value with no token, a new token.
- `criteria` names the journey criteria a board shows; `loadingFor` pairs a
  loading board with its loaded board.
- `notes` lists behaviour the design cannot show for that board (focus,
  scrolling, transitions), each citing its decision or journey ID.

Each ready board needs `id`, `screen`, `state`, `designScreenshot`, `designHash`
(SHA-256) and `designExport` caching structure, relevant computed styles and tokens.
Save opaque 8-bit non-interlaced RGB/RGBA PNGs at the viewport size. Optional
`captureSize: "1440x1800"` permits full-page captures at the same width; browser and
design dimensions must agree. Never resize to hide differences. Cache unchanged
exports and references. The draft example deliberately lacks Phone Loading and
some references; it must not pass readiness. Refresh legacy handoffs before use.

From verify's directory, run both checks on the scope before editing. Structural
validation can accept draft records; readiness and coverage require ready status,
complete states and pinned references.

```sh
bun scripts/check-design-coverage.ts /path/to/account-scope.json --inventory-only
bun scripts/check-design-coverage.ts /path/to/account-scope.json --ready
```

For each board, reach its state in a local or preview app at its viewport, using
its setup, clock and real user actions. Confirm the expected state before
capturing the browser screenshot. Compare it with the design reference at the
same viewport. Check the visual details and interactions named in the handoff.
Reuse one state/device capture for all matching criteria. Component fixtures prove
appearance, not authenticated routing, persistence or provider integration; check
those separately. Review saved pairs side by side, including layout, typography,
spacing, controls and content. Behavior alone does not establish visual fidelity.

Save `coverage.json` in a fresh evidence directory as an array with one row per
board. Use `matched`, `deviation` (with the `exception` ID that approves it),
`differs` or `blocked`. Include a specific `note` for a deviation, difference or
blocker and capture evidence where possible.

```json
[
  {
    "artboard": "Account settings · Phone · Loaded",
    "boardId": "file/page/phone",
    "status": "deviation",
    "exception": "E1",
    "note": "Native date input kept per E1; rest matches",
    "revision": "<tested-code-fingerprint>",
    "route": "/settings/account",
    "viewport": "390x844",
    "browserScreenshot": "phone-settings.png",
    "visualReview": { "layout": "pass", "typography": "pass", "spacing": "pass", "controls": "pass", "content": "pass" }
  }
]
```

The screenshot path can be absolute or relative to the report. Use a tested-code
fingerprint covering the commit and uncommitted product changes. Every row must
belong to that revision, route and viewport; never relabel old captures. From verify,
run the checker even when states are blocked:

```sh
bun scripts/check-design-coverage.ts /path/to/account-scope.json /path/to/coverage.json --revision <tested-code-fingerprint>
```

A passing run requires every included board, review flags and actual PNG pixel
comparisons. A channel delta above 32/255 counts as changed; more than 1% overall
or 20% of any 32×32 tile flags a mismatch. This allows small rasterization differences
while catching local omissions. Visual review still matters for small meaningful
differences and interaction. The checker reports evidence completeness and pixel
results, never product correctness.

For a visual `deviation`, its approved exception also lists `regions` as rectangles
with integer `x`, `y`, `width`, `height`. Only those regions are masked; the rest must
match and pass visual review. Masks cannot hide the whole capture. Exception IDs
are unique across the scope. Keep token-only exceptions separate from visual ones.

Use `--focus <board-id,board-id>` for a quick build pass with only those report rows.
It preserves the full inventory and prints **partial scope**, never completion.
One screenshot path cannot stand for different boards. Run one full acceptance
batch on finished code, including loading transitions; reuse it for final handover
and PR evidence. Save side-by-side or overlay images for differences.
The builder performs this visual review against existing approval; no new owner
approval is needed per state or slice.
