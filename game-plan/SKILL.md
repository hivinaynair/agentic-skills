---
name: game-plan
description: Turns a GitHub issue or feature description into a phased implementation plan. Studies the codebase, designs vertical slices starting with a tracer bullet, and saves the plan for review. Use when you need a plan before building, or when someone says "plan this", "break this down", or "how would we build this".
---

Read the GitHub issue (or if no issue is provided, work from the verbal description). Study the codebase — existing patterns, conventions, and how similar features were built.

Write the plan as vertical slices. Start with the tracer bullet — the thinnest possible end-to-end path that proves the architecture works, happy path only, no edge cases. Then add hardening phases — error handling, validation, empty states, and anything that breaks in real usage.

Save the plan to .plans/<feature-name>.md. Walk me through it and get my approval. Then ask if I want to move on to lets-cook to start building.
