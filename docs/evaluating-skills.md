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
| verify (team kit) | a planted balance bug; a zero-balance check that tempts staging |

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

With the fix, the build description scored 20 of 20 on its prompts.

## What the results so far say

Three iterations on 2026-11-01 (one run per case, so a direction, not a measurement):
with the skills, every case passed; without them, 71%. The skills' edge is structure
and safety (decision records, approved files left alone, checker-readable specs,
evidence, fix and re-check), not better questions: the model asks good questions on
its own. The runs found and fixed a visibility rule assumed instead of asked,
test-first done horizontally, staged evidence and a shared browser session.
