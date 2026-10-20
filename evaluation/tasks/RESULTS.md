# Tasks skill trial — 2026-10-20

One independent agent read the tasks skill and its record reference, then planned
three synthetic requests without implementing anything. These are planning results,
not execution, productivity, model-comparison or automatic-discovery evidence.
The parent reviewed the returned plans against the inputs and inspected fixtures.

| Request | Observed result | Review |
|---|---|---|
| New Bun/Next.js/PostgreSQL notes app: create, reopen and list own notes; reject anonymous/other-user access; local target | Two outcome tasks, proposed paths labeled, minimal foundations folded into the first durable flow | All five supplied criterion refs assigned; excluded sharing, labels, jobs and deployment stayed out |
| Existing notes form/list need durable integration | One integration task reusing SQL repository and identity check; identified local-storage form and sample list | Correctly noticed missing server, session and database connections; claimed source inspection only |
| Change one documentation heading | No new task artifact; single edit remains actionable | Avoided turning a trivial edit into planning paperwork |

New-app source references were supplied synthetic anchors: create.md#C1 (durable
create), #C2 (anonymous write denial); read.md#R1 (reopen), #R2 (anonymous/foreign
read denial); list.md#L1 (own list). That is five criterion references across three
files; the returned plan also assigned regression checks across tasks. No source
files or existing implementation were supplied for this case.

The existing-app input is preserved in [fixtures/existing](fixtures/existing).
Its AGENTS.md and spec.md were authoritative for the trial. Files were first placed
in a temporary workspace. Dispatch initially raced fixture creation; the agent
correctly reported the missing directory instead of inventing observations. A
follow-up after creation produced the actual-code plan. This was an evaluation
setup error, not an application blocker or a first-pass planning success.

Limits: neither app was built; database persistence and access behavior were not
executed. Both plans selected sequential work, so safe concurrent execution and
positive parallel grouping remain untested. The task skill has no automated
coverage/graph checker. The repository's Bun tests validate the existing journey
tooling, not these agent judgments. This single trial does not establish reliability
across models or projects; future corrections should follow observed failures.

To repeat: provide the skill and the above new-app/heading requests, and ask for an
implementation plan for the existing fixture using its spec.md and actual code.
Use a separate temporary workspace and prohibit implementation and repository edits.
