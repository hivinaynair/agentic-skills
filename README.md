# Agentic Skills

Planning skills for AI coding agents. They help you turn an app or feature idea
into a short, clear spec that you approve before any code is written.

## The problem

When you ask an agent to build something, it fills every gap in your request with
a guess: who is allowed to do it, what happens when payment fails, what the person
sees on a bad link. Those guesses end up in the code, and you find them later.

These skills make the agent stop and ask instead. It writes down what you decided,
asks only the questions that matter, maps what people will see and do, and tells
you plainly when the spec is complete enough to build.

## The three skills

| Skill | Use it when | You get |
|---|---|---|
| **decide** | You have an idea or a request and the rules are not settled | `docs/decisions.md`: your decisions, what is out of scope, and open questions |
| **journeys** | The decisions exist and you want to see how the feature behaves | `docs/journeys/<feature>.md`: each path a person takes, screen by screen, including errors |
| **tasks** | The spec is approved and you are ready to build | `docs/tasks/<feature>.md`: the build broken into usable pieces, in order |

Use them in that order, or pick the one you need. Small, precise changes need none of them.

## How it works

Say you ask: *"Use decide to plan password reset."*

**1. decide sharpens the idea.** For a new idea it first pins down the problem, who
it is for, the first thing they should be able to do, what is out of scope and how
you will know it worked. Then it asks the questions that block the work one at a
time, each with a recommendation, such as *"How long should a reset link work? I
suggest 30 minutes."* Safe defaults come as one batch you can accept together.
Every answer becomes one line:

```markdown
- D6 accepted — A reset link works once and expires 30 minutes after it is sent.
- X1 accepted — Recovery by SMS is out of scope.
- Q2 open — Should a reset sign out other devices? Recommend: yes. Blocks: J2.S3.
```

**2. journeys maps what people see and do.** Each step names the screen, what the
person sees, and the rules as testable sentences:

```markdown
### J2.S1 Open the reset link (person)
Screen: Reset password · Sees: new password form, or "This link no longer works"
Basis: D6
- c1: WHEN the person opens a usable link THE SYSTEM SHALL show the new password form
- c2: IF the link is expired or used THE SYSTEM SHALL NOT show the form
→ J2.S2 when the link is usable
→ exit link-unusable when the link is expired or used
```

For every journey it also answers four questions: what happens when someone is
**not allowed**, enters **bad input**, hits a **failure**, or **repeats** the action.
Those are where most bugs hide. Before asking for approval, the agent reads each
step beside the decisions it rests on, to catch steps that do not follow from them.

**3. You approve.** When nothing is missing, the agent shows a short summary and
asks *"Approve for build?"*. Your yes is recorded and stamped into the file. If
someone later changes the journeys or the decisions they rely on, the approval no
longer counts until you approve again.

**4. tasks plans the build.** It splits the work into pieces a person can actually
use, says which can be built in parallel, notes how to work with outside services
such as payment providers, and gives each piece a way to verify it.

## Who decides what

You (the owner) decide what the product does: who may do what, and what people
see. The agent building it decides how: databases, retries, code structure. The
skills keep these apart, so the spec stays short and readable, and the technical
choices live in the task plan where developers need them.

## The checker

The journeys skill includes a small checker that catches mistakes a reviewer
easily misses: a step nothing leads to, a path that never ends, a rule that cites a
decision that does not exist or was replaced, a decision no step covers, a question
left open, a missing approval. It is plain code with no AI, so it checks structure;
`--review` prints each step beside the decisions it rests on, for a person or agent
to judge the meaning.

```sh
bun skills/journeys/scripts/journeys.ts check docs/journeys/password-reset.md          # while drafting
bun skills/journeys/scripts/journeys.ts check docs/journeys/password-reset.md --review # read for meaning
bun skills/journeys/scripts/journeys.ts check docs/journeys/password-reset.md --ready  # before building
bun skills/journeys/scripts/journeys.ts approve docs/journeys/password-reset.md D11    # record approval
```

It needs [Bun](https://bun.sh) 1.4+ and nothing else. It cannot tell whether the
product idea is right or the code works. `skills/journeys/scripts/pre-commit.sh`
runs the same check from a Git hook.

## Install

Copy the skill folders into the folder your agent loads skills from. For Claude
Code that is `.claude/skills/` in your project, or `~/.claude/skills/` for every project:

```sh
git clone https://github.com/hivinaynair/agentic-skills.git
mkdir -p .claude/skills
cp -R agentic-skills/skills/decide agentic-skills/skills/journeys agentic-skills/skills/tasks .claude/skills/
```

Then ask in plain words: *"Use decide to shape this idea"*, *"Map the journeys for
password reset"*, *"Plan the tasks for the approved journeys"*. If your agent has no
skill folder, point it at a skill's `SKILL.md` file directly.

## Examples

Start with the [examples folder](examples/):

- [Password reset](examples/password-reset/): the full flow from idea to
  approved journeys and tasks.
- [Team invitations](examples/team-invitations/): a spec that is not ready yet,
  with four open questions, to show what blocked looks like.

Run `bun run verify` to check the skills, tests and examples.

## Evidence so far

In a small blind-judged trial (2026-10-25), agents using these skills invented no
product rules and gave the clearest "ready or not" answer, with about half the text
of agents without them. Agents without the skills went deeper on payment-provider
details, which these skills leave to the task plan. One run per case, so treat it
as a direction, not a measurement.

## Background

Acceptance sentences use [EARS](https://doi.org/10.1109/RE.2009.9) (Easy Approach
to Requirements Syntax). Inspired by [Superpowers](https://github.com/obra/superpowers),
[Spec Kit](https://github.com/github/spec-kit) and [OpenSpec](https://github.com/Fission-AI/OpenSpec).
MIT licensed.
