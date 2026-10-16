# Skill instruction reduction

The two entry points are 32% smaller by the measured encoding; the six skill
Markdown files together are 26.6% smaller. This measures text size, not billable
session savings or a quality improvement rate.

## Measurement

Baseline: `fc5b271c670a4d92a163f95eb7887dc5527db31e`, including ticket clarification.
[count.ts](count.ts) counts each complete file, including frontmatter, using
`gpt-tokenizer@4.0.3` with `o200k_base`, then sums those counts.
[Recorded counts and current-file hashes](tokens.json):

| Scope | Before | After | Reduction |
|---|---:|---:|---:|
| decide entry point | 739 | 452 | 38.8% |
| journeys entry point | 759 | 567 | 25.3% |
| Both entry points | 1,498 | 1,019 | 32.0% |
| Both skills and all references | 4,997 | 3,666 | 26.6% |

The schema keeps a complete draft example. Format fields and ID lifecycle have
one detailed reference each; conditional existing-code review is loaded only for
that work. Repeated prose and generic explanations were compressed. Ticket
clarification, policy authority, observations, coverage before graph mapping,
EARS-style criteria, branch review, stable IDs, manual fallback and evidence limits
remain explicit.

Only names/descriptions may be loaded for unused skills. References are conditional,
so summing every file is not the context cost of every invocation. Other tokenizers,
tool calls, file reads, model output and caching affect actual usage. The source
package is [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer); no tokenizer
runtime dependency was added to this repository or the skills.

To repeat the count, install the measuring package in a separate temporary folder:

```sh
tokenizer_dir=$(mktemp -d)
bun add --cwd "$tokenizer_dir" --ignore-scripts --exact gpt-tokenizer@4.0.3
bun evaluation/skill-efficiency/count.ts fc5b271c670a4d92a163f95eb7887dc5527db31e "$tokenizer_dir/node_modules/gpt-tokenizer/esm/encoding/o200k_base.js"
```

The baseline must exist locally; if necessary, fetch this change's PR history first.
The temporary package is for measurement only and can be removed afterward.

## Behavior checks

Fresh sessions ran the same four [discovery runner](../discovery/run.ts) cases,
without naming either skill in prompts. [Results](behavior.json) record exact
prompts, installed entry-point hashes, inputs, outputs and scoring limits.

| Case | Confirmed selection |
|---|---|
| Invitation requirements without a ticket | decide |
| Agreed task-archiving requirements | journeys |
| Small README edit | Neither |
| Vague company CSV-export ticket | decide |

The first shorter draft passed all four invocation checks, but manual review caught
an inferred recipient-binding requirement and a placeholder journey criterion.
Two short source-fidelity/gap-recording rules were made explicit, and all four cases
were rerun. The final CSV output kept row scope, roles and fields open for the PM.
The final journey output has concrete criteria and unresolved coverage/branch reviews
rather than placeholder behavior. Draft/freshness checks pass with 15 rules; coverage
and readiness correctly remain blocked.

Selection scoring is not a semantic test. Manual review still found an unsupported
"not selected" label for recipient-bound delivery in the invitation alternatives;
it was not promoted to an accepted requirement in the final record, but still needs
source correction. These examples do not prove zero regression or general quality
parity. Do not treat formatting or smaller instructions as policy correctness.

All 52 offline tooling tests and metadata/reference checks pass. Runtime validator
behavior was not changed. Actual discovery trials use Codex CLI on macOS; the skill
instructions remain platform-neutral. Raw projects and traces stay in the temporary
folders emitted by the runner; they are not copied into the skills.
