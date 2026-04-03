---
name: lets-cook
description: Turns a GitHub issue into a phased plan and executes it. Reads the issue, studies the codebase, plans vertical slices, then builds phase by phase with TDD.
dependencies:
  - plugin: tdd
---

Read the GitHub issue(or if no issue is provided, work from the verbal description). Study the codebase — existing patterns, conventions, and how similar features were built. Build the tracer bullet first — the thinnest possible end-to-end path that proves the architecture works.

Happy path only, no edge cases. Then harden it — error handling, validation, empty states, and anything that breaks in real usage.Save the plan to .plans/<feature-name>.md.

Save the plan to .plans/<feature-name>.md. Then execute using the tdd skill. After all phases pass, confirm with me that the feature is complete.
