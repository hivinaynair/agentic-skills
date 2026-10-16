# Evaluation notes

The included invitation example is a synthetic planning trial. A separate agent
received the skills and the [brief](brief.md), then wrote decisions and journeys.
It preserved accepted requirements, kept observed behavior distinct from policy,
and exposed unresolved role, input and recovery questions.

Review caught an initial mistake: some unspecified applicable risks were labeled
not-applicable. The branch guidance and example were corrected. The validator did
not discover that semantic mistake by itself.

The example has three journeys and 21 criteria/invariant rules. It predates the
coverage inventory field, so draft validation also warns that its inventory is
missing. It remains a deliberate incomplete fixture; readiness must fail.

Current tooling checks cover graph/reference errors, policy versus observations,
coverage mappings and exclusions, retired IDs, verification links, stale Markdown
and staged-snapshot hook behavior. Run `bun test` for the current test count.
Tests include deleting a mapped journey and verifying it fails, and deleting both
the journey and its inventory goal to demonstrate what structural checks cannot detect.

The code was exercised with Bun 1.4.0-canary.1 on macOS. This does not establish
stable-release Bun, Windows hook or cross-agent installer compatibility. The skill
instructions were exercised through explicit file paths in Codex. A subsequent
[discovery trial](discovery/RESULTS.md) also confirmed implicit selection of both
project-local skills in Codex CLI for the recorded prompts. There is no
controlled productivity benchmark or claim of universal project coverage.

Project-specific source-review artifacts remain outside this repository. The
included example and validator tests are self-contained and require no private repo.

The optional skill-creator Python checker could not run because PyYAML is not
installed. The Bun metadata and local-reference checks passed instead; this is not
a claim that the Python checker passed.
