# Paper coverage

Before editing or checking the app, reconcile the Ready for build list with the
approved Paper pages and save the exact artboard names as a JSON string array
in `approved.json`. Keep that inventory fixed through retries. For a request to
verify a subset, record its scope explicitly. Completing the full handoff
requires the full approved inventory.

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
    "artboard": "Admissions · Worklist · Phone · Loading",
    "status": "matched",
    "paperReference": "https://example.test/paper/admissions",
    "browserScreenshot": "phone-loading.png"
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
