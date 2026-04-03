---
name: lets-cook
description: Executes an implementation plan phase by phase using TDD. Use when there's already a plan in .plans/ or a GitHub issue and you're ready to build. Triggers on "lets cook", "start building", "execute the plan", or "build it".
dependencies:
  - plugin: tdd
---

Pick up the plan from .plans/<feature-name>.md (or if no plan exists, read the GitHub issue or verbal description and build one first). Execute phase by phase using the tdd skill — tracer bullet first, then hardening.

After all phases pass, run a code review by spawning these subagents in parallel using the Agent tool:

1. Structure reviewer — are files too long? Should anything be split into smaller components or functions? Is there a clear separation of concerns?
2. Readability reviewer — are names clear? Could someone new to the codebase follow the code without help? Are there magic values that should be constants?
3. Conventions reviewer — does the new code follow the patterns already in the project? Consistent styling, imports, file organization?
4. Duplication reviewer — is there copy-pasted logic that should be extracted? Are there utility functions that should exist but don't?

Collect all findings, fix what needs fixing (run tests after each fix to make sure nothing breaks), then walk me through what was cleaned up and confirm the feature is complete.
