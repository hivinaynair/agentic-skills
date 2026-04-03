---
name: lets-cook
description: Executes an implementation plan phase by phase using TDD. Use when there's already a plan in .plans/ or a GitHub issue and you're ready to build. Triggers on "lets cook", "start building", "execute the plan", or "build it".
dependencies:
  - plugin: tdd
---

Pick up the plan from .plans/<feature-name>.md (or if no plan exists, read the GitHub issue or verbal description and build one first). Execute phase by phase using the tdd skill — tracer bullet first, then hardening.

After all phases pass, confirm with me that the feature is complete.
