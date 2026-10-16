# Codex project discovery trial

On 2026-10-16, both repository-local skills were automatically selected and read
in fresh Codex CLI 0.147.0 sessions on macOS. A small README edit loaded neither.
This tests discovery and selection, not a general measure of specification quality.

## Method

The [runner](run.ts) creates a temporary Git project for each case and copies both
complete skill folders into `.agents/skills`. There is no AGENTS.md routing hint,
no prior conversation and no skill name or path in the task prompts. Each invocation
uses `codex exec --ignore-user-config --ephemeral --json -s workspace-write` with the
CLI's default model; no model override was supplied.

User configuration was ignored. User/admin/system skills were not disabled, so
this is not an environment containing only these two skills. The scoring requires
successful reads of the exact repository-local entry points, not similarly named
personal skills. No real project, global skill directory or user configuration was edited.

The journey case starts with an agreed synthetic decision record. The decide case
starts with neutral project context and incomplete invitation requirements. The
negative control requests only a README heading change.

## Results

| Case | Expected | Confirmed local instruction read | Artifact |
|---|---|---|---|
| Requirements capture | decide | `.agents/skills/decide/SKILL.md` | `docs/decisions.md`, with unresolved policy retained |
| Behavior mapping | journeys | `.agents/skills/journeys/SKILL.md` | YAML specification and generated Markdown |
| Small wording edit | Neither | Neither | Requested README heading changed |

[Recorded results](results.json) contain the exact prompts, skill entry-point hashes,
process exit codes, seeded document inputs and generated-file lists. The runner accepts a read only when a
completed shell command names the local skill entry point, exits successfully and
returns that skill's instruction heading. Final self-reports alone do not pass.
All three selected cases passed this check, and the negative edit was verified.

The first decide attempt announced selection and attempted to read the right file,
but its compound command also searched an empty project for docs and exited 1 with
no captured body. The strict scorer reported it as unconfirmed. A neutral context
file was added to the fixture and only decide was rerun; that read succeeded. This
was a fixture correction, not a skill-description change or evidence of universal
selection reliability. The other two cases use their original fresh sessions.

The generated journey record exposed unspecified failure/recovery behavior rather
than approving new policy. Document correctness and complete behavior coverage were
not scored by this discovery test. There was no explicit-invocation comparison or
repeated statistical selection benchmark.

## Reproduce

Requires Bun and an authenticated Codex CLI. This launches model sessions and uses
account quota; it is deliberately not included in `bun test`.

```sh
bun evaluation/discovery/run.ts
# Or rerun one case:
bun evaluation/discovery/run.ts implicit-decide
```

The runner prints its temporary artifact directory and JSON results. Raw command
traces and model output stay there, outside this repository. Each session has a
five-minute process timeout. The checked-in summary omits machine-specific paths.

New runs capture `startedAt` at execution in UTC and derive `date` from that
timestamp. Fixed dates inside the synthetic decision record are fixture data only.
Before launching Codex, the runner snapshots the document inputs. It reports new
documents under `generatedFiles`, seeded documents under `inputFiles`, and changed
or removed inputs under `modifiedInputFiles` or `removedInputFiles` respectively.
These fields cover documents under `docs/`; the negative README edit is checked
separately.

Review corrected the original summary, which had counted `docs/context.md` and the
journey fixture's `docs/decisions.md` as generated. They now appear as inputs, using
the known fixture definitions. The original trial date and selection results are
preserved. No model sessions were repeated for this correction, and changes to
the original inputs cannot be reconstructed from the old filename-only inventory.

The offline [runner regression test](../../tests/discovery-runner.test.ts) uses a
stub Codex executable and a simulated 2031 clock to verify provenance and runtime
dating without authentication, network access or model quota. It does not count
as another automatic-discovery trial.

The test exercises Codex CLI project installation. It does not verify Codex desktop
skill selectors, personal-directory installs, Claude Code, Cursor, other operating
systems or every prompt wording. No hook or automatic chaining was enabled.
