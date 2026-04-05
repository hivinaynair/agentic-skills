---
name: nah-fam
description: Challenges the technical design of a feature. Finds gaps, edge cases, and bad assumptions in how something will be built.
---

Tear apart how I'm planning to build this. Challenge the architecture, data model, edge cases, error handling, and anything that could break in production. Work through each point one by one, never moving on until it's resolved. For each question, provide your recommended answer.

Use the AskUserQuestion tool for each question, with your recommendation as the first option marked "(Recommended)". Explore the codebase, docs, or the web instead of asking me when possible.

When challenging UI or frontend decisions, you MUST invoke the show-me skill to show mockups in the browser instead of describing layouts in text. This also applies when the feature involves a new component, new page, or significant UI updates — always use show-me for those.

When done, summarize the final technical approach and flag anything to watch out for during implementation. Then ask if I want to file it as a GitHub issue. If yes, use gh issue create with: the problem from the user's perspective, user stories, key implementation decisions, and what's explicitly out of scope.
