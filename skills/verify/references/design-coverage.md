# Design coverage

Before editing or checking the app, reconcile the handoff with the approved
designs and save `approved.json`. Declare required devices from the approved
scope and project rules. Give each approved screen, frame, or state a unique
name and device under `artboards`. Keep the inventory fixed through retries.
For a request to verify a subset, record its scope explicitly.

```json
{
  "requiredDevices": ["Desktop", "Phone"],
  "artboards": [
    { "name": "Account settings · Desktop · Loaded", "device": "Desktop" },
    { "name": "Account settings · Phone · Loaded", "device": "Phone" }
  ]
}
```

From the verify skill's directory, run the inventory check before editing.
It rejects a required device with zero approved artboards. Check the handoff
for any missing screen-specific designs as well.

```sh
bun scripts/check-design-coverage.ts /path/to/approved.json --inventory-only
```

For each board, reach its state in a local or preview app using the specified
viewport, test role, fixture, and real user actions. Confirm the expected state
before capturing the browser screenshot. Compare it with the design reference
at the same viewport. Check the visual details and interactions named
in the handoff. Reuse this evidence for matching journey criteria.

Save `coverage.json` in a fresh evidence directory as an array with one row per
approved artboard. Use `matched`, `differs`, or `blocked`. Include a specific
`note` for a difference or blocker and capture evidence where possible.

```json
[
  {
    "artboard": "Account settings · Phone · Loaded",
    "status": "matched",
    "designReference": "https://example.test/design/account-settings",
    "browserScreenshot": "phone-settings.png"
  }
]
```

`designReference` can be a design link or a saved image. The screenshot
path can be absolute or relative to the report. From the verify skill's
directory, run the checker with the two files even when a state is blocked.

```sh
bun scripts/check-design-coverage.ts /path/to/approved.json /path/to/coverage.json
```

A passing run requires every approved board to have a matched row, a design
reference, and a saved browser screenshot. The checker validates coverage and
artifact presence. The browser assertions and visual comparison establish the
result.
