# Evaluating the skills

Two kinds of test, both runnable on any machine with Claude Code logged in. They
make real, billed model calls on your account.

## Behaviour: the test cases

Each skill's `evals/<case>/` folder is a test in the layout `claude plugin eval`
reads: `prompt.md` (the user's request), `files/` (the project it runs in),
`graders/` (one checkable statement each) and `case.yaml`.

| Skill | Cases |
|---|---|
| decide | a vague ticket; a change that conflicts with an approved decision |
| journeys | mapping approved decisions without inventing rules |
| tasks | none yet |
| build | a planned task; a test-budget temptation; a one-slice spec with no task plan |
| verify | a planted balance bug; a zero-balance check that tempts staging |

Run them with and without the skill from a skill's folder:

```sh
claude plugin eval . --scaffold --allow-tools Write,Edit,Bash
```

Or use Anthropic's skill-creator skill ("run the evals for this skill"), which runs
each case with the skill and with a baseline, grades the statements and opens a
review page.

## Triggering: the description optimizer

`evals/trigger-queries.json` holds 20 prompts per skill: 10 that should use it and
10 near-misses that should not. Anthropic's skill-creator measures how often a
description triggers on them and proposes better descriptions:

```sh
cd <an empty folder with a .claude directory>
python -m scripts.run_loop --eval-set <skill>/evals/trigger-queries.json \
  --skill-path <skill> --model <model id> --max-iterations 3
```

(run with `PYTHONPATH` pointing at skill-creator, and `CLAUDECODE` unset when
running inside a Claude Code session).

**Fix before running in parallel.** In the skill-creator version used here,
`scripts/run_eval.py` writes every query's temporary command file into one shared
`.claude/commands` folder. Parallel workers then see each other's copies of the same
description and pick one at random, so a trigger is counted only about one time in
`--num-workers`: recall reads 6–17% for descriptions that really trigger every time.
Either run with `--num-workers 1`, or patch `run_single_query` to give each query
its own folder:

```python
import tempfile, shutil
isolated_root = tempfile.mkdtemp(prefix="trigger-eval-")
project_root = isolated_root   # right after clean_name is set
# ...and in the final cleanup:
shutil.rmtree(isolated_root, ignore_errors=True)
```

With the fix (2026-11-01), every description triggered correctly on round one, so
the optimizer kept them all: decide, journeys, tasks and verify 36/36 on training
runs, build 35/36, and all five 8/8 on held-out prompts. Each skill was tested
alone there; routing between them is below.

## Routing: the right skill among ours

With decide, journeys, tasks and build all in one scratch folder's
`.claude/skills/`, each of the 40 should-trigger prompts ran 3 times, one at a time:

```sh
claude -p "<prompt>" --output-format stream-json --verbose --max-turns 2 \
  --setting-sources project --strict-mcp-config
```

`--setting-sources project` keeps your own `~/.claude` skills and plugins out, so
only these four and Claude Code's built-in skills compete. Run it from a terminal,
or with a clean environment: inside the desktop app the inherited variables point
the child at the app's session. The result is the first Skill tool call in the stream.

Results on 2026-11-01 (claude-opus-5-5):

| Expected ↓ / chosen → | decide | journeys | tasks | build | none |
|---|---|---|---|---|---|
| decide | 30 | 0 | 0 | 0 | 0 |
| journeys | 0 | 29 | 0 | 0 | 1 |
| tasks | 0 | 0 | 30 | 0 | 0 |
| build | 0 | 0 | 0 | 28 | 2 |

No prompt went to another of our skills or to a built-in one, so the descriptions
were left as they are. The three misses read files first and had not called a
skill within two turns: build's *"start on the first task that can start now in
docs/tasks/wishlist.md"* (2 of 3) and journeys' *"check that every approved decision
for subscriptions is covered by some step"* (1 of 3). The 40 near-miss prompts
(should not trigger) were not run in this setup, and verify, then part of the team
kit, was not installed for this run.

## What the results so far say

Three iterations on 2026-11-01 (one run per case, so a direction, not a measurement):
with the skills, every case passed; without them, 71%. The skills' edge is structure
and safety (decision records, approved files left alone, checker-readable specs,
evidence, fix and re-check), not better questions: the model asks good questions on
its own. The runs found and fixed a visibility rule assumed instead of asked,
test-first done horizontally, staged evidence and a shared browser session.
