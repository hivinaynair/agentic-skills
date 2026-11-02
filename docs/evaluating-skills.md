# Evaluating the skills

Two kinds of test, both runnable on any machine with Claude Code logged in. They
make real, billed model calls on your account.

## Behaviour: the test cases

Each skill's `evals/<case>/` folder is a test in the layout `claude plugin eval`
reads: `prompt.md` (the user's request), `files/` (the project it runs in),
`graders/` (one checkable statement each) and `case.yaml`.

| Skill | Cases |
|---|---|
| decide | a vague ticket; a change that conflicts with an approved decision; answers already settled in the record and call notes |
| journeys | mapping approved decisions without inventing rules; an unknown card payment, cross-studio access and a full class |
| tasks | none yet |
| build | a planned task; a test-budget temptation; a one-slice spec with no task plan |
| verify | a planted balance bug; a zero-balance check that tempts staging |

Run them with and without the skill from a skill's folder:

```sh
claude plugin eval . --scaffold --allow-tools Write,Edit,Bash --judge-model sonnet
```

Or use Anthropic's skill-creator skill ("run the evals for this skill"), which runs
each case with the skill and with a baseline, grades the statements and opens a
review page.

**Point each grader at what it judges.** An llm grader's `focus` decides what the
judge reads. `trace` cuts the middle of a long run, so a file written there or a
command run there may be missing. `files` lists only the names of changed files.
To judge a file's content, use `focus: {source: file, path: docs/decisions.md}`;
to judge the reply, `focus: last_message`; for a deterministic check, a `regex`
grader. Name the output path in the prompt so a file grader can find it. The
default haiku judge failed graders whose files plainly passed; use sonnet.

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

## Old against new: question and journey precision

On 2026-11-02 the two newest cases ran once each against `main` (old) and
`vinay/spec-precision` (new), skill arm only (`--ablation none --runs 1`), $2.26 in all.

| Case | Old | New | New fixed | Still failing |
|---|---|---|---|---|
| decide-settled-answers | 5/9 | 7/9 | re-asking settled answers, duplicate questions | a bundled question; precise money and permission lines |
| journeys-pending-payment | 5/9 | 7/9 | pending payment path, cross-studio denial, Basis and screen repetition | checker run not seen by the judge; criteria written to open recommendations |

New decide asked more first-slice questions, 13 against 9: splitting bundles and
always asking about money turned low-stakes choices (discounts, receipts, booking
cutoff) into questions. The judge sees an elided transcript, so a grader on a step
in the middle of a run, such as running the checker, can fail although it happened.

**Second round** (same day, $2.25): decide now leaves extras the first slice can
ship without (discounts, overrides, receipts) as assumptions, and asks always only
about what is charged or refunded. A 10th decide grader caps blocking questions at
8; the journeys checker and invented-rule graders were reworded to what the judge
can see.

| Case | Old | New |
|---|---|---|
| decide-settled-answers | 6/10 | 5/10 |
| journeys-pending-payment | 5/9 | 7/9 |

New decide asked 9 questions (13 before the tuning), the same as old; receipts and
discounts became assumptions. Its score moved 7/9 → 5/10 and old's 5/9 → 6/10
between rounds, so one run per case cannot rank decide; run it with `--runs 3`.
Both missed the unknown card result because the case never said the terminal is
connected to the app; the call notes now say so. Journeys kept its gain.

**Third round** (decide only, `--runs 3`, $2.39), after the call notes said the
terminal is connected:

| Grader | Old | New |
|---|---|---|
| no settled answer re-asked | 2/3 | 3/3 |
| asks about an unknown card result | 2/3 | 3/3 |
| at most 8 blocking questions | 0/3 | 1/3 |
| one choice per question | 0/3 | 0/3 |
| precise money and permission lines | 0/3 | 0/3 |
| the other five | 13/15 | 14/15 |
| **total** | **18/30** | **21/30** |

New runs scored 6, 8 and 7; old 6, 6 and 6. New asked 9 or 10 blocking questions.
Both versions fail the bundling and precision graders every time. The haiku judge
gives no reasons, so whether that is the skill or a strict grader is still open; a
recorded refund line such as "full refund" without saying when it is paid is one
likely cause.

**Grader audit** (same day). Reading the six round-three runs by hand showed the
judge could not see what most graders asked about: the decision record was written
in the elided middle of the trace. Graders now read `docs/decisions.md`, the
journeys spec (its path is now in the prompt) or the final reply, with a sonnet
judge. One validation run of the new skills, $1.24:

| Case | Score | Failures, checked against the files |
|---|---|---|
| decide-settled-answers | 7/10 | real: one question joins two choices with "and"; a cancel rule omits which studio; the terminal's three results are only in a question |
| journeys-pending-payment | 6/9 | real: the cross-studio `exit denied` never says what the desk sees; borderline: price repeated across steps, a few display details no decision states |

The two real failure kinds led to two skill lines: a question joining two choices
with "and" is two questions, and a denied branch reaches an outcome the person sees.
These, and old-against-new under the new graders, are not yet re-run.
