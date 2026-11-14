# Layout audit

Screenshots and criteria miss small layout faults that people notice at once,
such as two buttons side by side at different heights. The audit measures the
page and reports them. It only reads: it never changes the page.

```sh
ab eval "$(bun scripts/layout-audit.ts --snippet)"
```

It returns `{ "checked": n, "issues": [...] }` for the current page and
viewport, checking:

- controls side by side (within 24px, overlapping rows) share one height and
  one centre line, links styled as buttons included;
- icon-only buttons are square;
- on a phone viewport (narrower than 768px), targets are at least 44px and at
  least 8px apart;
- table cells holding numbers are right-aligned.

Run it once on each changed screen/state/device, sharing the result across criteria.
An issue on a screen this change touched is a failure: fix it in the code and
check affected states and shared-component dependents within the usual three rounds.
One that was there before is listed
as found, not fixed. When the host's `DESIGN.md` sets other values, such as a
different minimum target, follow it and say so in the report.

The audit covers only what it can measure. Check the host's other design
rules by eye on the screenshots.
