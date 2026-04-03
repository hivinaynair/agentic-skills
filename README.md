# vinay-skills

A workflow toolkit for building features with Claude — from idea validation through implementation.

## The workflow

These four skills chain together into a complete feature development pipeline:

```
be-fr → nah-fam → lets-cook → show-me (at any visual decision point)
```

**be-fr** — Challenges whether a feature is worth building. Questions who wants it, the real pain, what you're giving up, and whether the problem is already solved. Researches competitors and market demand before grilling you.

**nah-fam** — Challenges the technical design. Tears apart architecture, data model, edge cases, and anything that could break in production. Files the result as a GitHub issue when you're ready.

**lets-cook** — Turns a GitHub issue into a phased plan and executes it. Builds the thinnest end-to-end path first (tracer bullet), then hardens with error handling and edge cases. Uses TDD throughout.

**show-me** — Renders UI decisions in the browser instead of describing them in text. Used by nah-fam during frontend discussions, or standalone when you want to compare layouts.

## Install

Install individual skills:

```bash
npx skills@latest add hivinaynair/agentic-skills/be-fr
npx skills@latest add hivinaynair/agentic-skills/nah-fam
npx skills@latest add hivinaynair/agentic-skills/lets-cook
npx skills@latest add hivinaynair/agentic-skills/show-me
```

### Dependencies

`lets-cook` and `show-me` depend on skills from other authors, bundled here for convenience:

```bash
npx skills@latest add hivinaynair/agentic-skills/tdd
npx skills@latest add hivinaynair/agentic-skills/brainstorming
```

| Skill | Source | Author |
|-------|--------|--------|
| tdd | [mattpocock/skills](https://github.com/mattpocock/skills/tree/main/tdd) | Matt Pocock |
| brainstorming | [obra/superpowers](https://github.com/obra/superpowers/blob/main/skills/brainstorming/) | Jesse Vincent |

### Install all at once

```bash
npx skills@latest add hivinaynair/agentic-skills/be-fr hivinaynair/agentic-skills/nah-fam hivinaynair/agentic-skills/lets-cook hivinaynair/agentic-skills/show-me hivinaynair/agentic-skills/tdd hivinaynair/agentic-skills/brainstorming
```

## Usage

Just describe what you want to build and Claude will pick the right skill:

- *"I want to add dark mode"* → triggers **be-fr** (is it worth building?)
- *"Should we go with SSR or client-side rendering for the dashboard?"* → triggers **nah-fam** (technical challenge)
- *"Cook issue #42"* → triggers **lets-cook** (plan and build)
- *"I don't like how the sidebar looks"* → triggers **show-me** (visual mockups)

Or invoke them directly: `/be-fr`, `/nah-fam`, `/lets-cook`, `/show-me`

## Credits

- [Matt Pocock](https://github.com/mattpocock) — tdd skill
- [Jesse Vincent](https://github.com/obra) — brainstorming skill

## License

MIT
