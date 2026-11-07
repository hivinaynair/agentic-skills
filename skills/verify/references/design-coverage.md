# Design coverage

The **handoff file** is the contract between the approved designs and the build.
The design handoff writes it, the build reads it, and verify checks the result
against it. Keep it in the host repository, by default at
`docs/design/handoff/<feature>.json`. When the handoff has none, reconcile the
approved designs and the notes into one before editing the app. Keep the board
list fixed through retries. For a request to verify a subset, record its scope
explicitly.

```json
{
  "feature": "Account settings",
  "designSource": "https://example.test/design/account-settings",
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
      "name": "Account settings · Desktop · Loaded",
      "device": "Desktop",
      "route": "/settings/account",
      "setup": "bun run seed:demo; sign in as owner@demo.test",
      "criteria": ["J4.S1.c1"]
    },
    {
      "name": "Account settings · Desktop · Loading",
      "device": "Desktop",
      "route": "/settings/account",
      "setup": "Throttle the account request",
      "loadingFor": "Account settings · Desktop · Loaded"
    },
    {
      "name": "Account settings · Phone · Loaded",
      "device": "Phone",
      "route": "/settings/account",
      "setup": "bun run seed:demo; sign in as owner@demo.test",
      "criteria": ["J4.S1.c1"]
    }
  ]
}
```

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

From the verify skill's directory, run the inventory check before editing. It
rejects missing devices, boards without a route or setup, and dangling
references.

```sh
bun scripts/check-design-coverage.ts /path/to/handoff.json --inventory-only
```

For each board, reach its state in a local or preview app at its viewport, using
its setup, clock and real user actions. Confirm the expected state before
capturing the browser screenshot. Compare it with the design reference at the
same viewport. Check the visual details and interactions named in the handoff.
Reuse this evidence for matching journey criteria.

Save `coverage.json` in a fresh evidence directory as an array with one row per
board. Use `matched`, `deviation` (with the `exception` ID that approves it),
`differs` or `blocked`. Include a specific `note` for a deviation, difference or
blocker and capture evidence where possible.

```json
[
  {
    "artboard": "Account settings · Phone · Loaded",
    "status": "deviation",
    "exception": "E1",
    "note": "Native date input kept per E1; rest matches",
    "designReference": "https://example.test/design/account-settings",
    "browserScreenshot": "phone-settings.png"
  }
]
```

`designReference` can be a design link or a saved image. The screenshot path
can be absolute or relative to the report. From the verify skill's directory,
run the checker with the two files even when a state is blocked.

```sh
bun scripts/check-design-coverage.ts /path/to/handoff.json /path/to/coverage.json
```

A passing run requires every board to be `matched`, or a `deviation` whose
exception lists that board, with a design reference and a saved browser
screenshot. The checker validates the contract and the evidence files. The
browser assertions and visual comparison establish the result.
