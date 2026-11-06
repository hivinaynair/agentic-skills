# Paper coverage

Before editing or checking the app, reconcile the Ready for build list with the
approved Paper pages and save `approved.json`. Declare required devices from
the approved scope and project rules, then list the exact artboard names and
their devices. Keep the inventory fixed through retries. For a request to
verify a subset, record its scope explicitly.

```json
{
  "requiredDevices": ["Desktop", "Phone"],
  "artboards": [
    { "name": "Admissions · Enroll · Desktop · New customer", "device": "Desktop" },
    { "name": "Admissions · Enroll · Phone · New customer", "device": "Phone" }
  ]
}
```

From the verify skill's directory, run the inventory check before editing.
It rejects a required device with zero approved artboards. Check the handoff
for any missing screen-specific designs as well.

```sh
bun scripts/check-paper-coverage.ts /path/to/approved.json --inventory-only
```

For each board, reach its state in a local or preview app using the specified
viewport, test role, fixture, and real user actions. Confirm the expected state
before capturing the browser screenshot. Compare the screenshot with the Paper
reference at the same viewport. Check the visual details and interactions named
in the handoff. Reuse this evidence for matching journey criteria.

Save `coverage.json` in a fresh evidence directory as an array with one row per
approved artboard. Use `matched`, `differs`, or `blocked`. Include a specific
`note` for a difference or blocker and capture evidence where possible.

```json
[
  {
    "artboard": "Admissions · Enroll · Phone · New customer",
    "status": "matched",
    "paperReference": "https://example.test/paper/admissions",
    "browserScreenshot": "phone-new-customer.png"
  }
]
```

`paperReference` can be a Paper link or a saved design image. The screenshot
path can be absolute or relative to the report. From the verify skill's
directory, run the checker with the two files even when a state is blocked.

```sh
bun scripts/check-paper-coverage.ts /path/to/approved.json /path/to/coverage.json
```

A passing run requires every approved board to have a matched row, a Paper
reference, and a saved browser screenshot. The checker validates coverage and
artifact presence. The browser assertions and visual comparison establish the
result.
