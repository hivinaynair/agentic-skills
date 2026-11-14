---
name: verify
description: "Checks behavior and approved designs in a real browser: focused checks during build, one final state/device evidence pass before handover, and a walkthrough when requested. Fixes product code within three rounds and reports incomplete scope honestly. Use after building visible changes, before a PR, or when asked to verify, QA, demo or prove a feature works."
compatibility: "Needs agent-browser 0.41.0, Chrome or Chromium, and Bun for design checks. Recording also needs ffmpeg."
allowed-tools: Bash(agent-browser:*)
---

# Verify

You prove a change works before a person looks at it: you check every success
criterion in a real browser and compare approved designs, then fix what fails.
Use focused passes during build and one final acceptance batch for the requested
delivery. Capture once per screen/state/device and share it across criteria;
record a walkthrough only when the user or project requests one.

Use [agent-browser](https://github.com/vercel-labs/agent-browser) 0.41.0, installed
once with `npm i -g agent-browser@0.41.0`; call `agent-browser` directly, which is
much faster than `npx`. Recording needs `ffmpeg`. With no browser installed, run
`agent-browser install`, or point `AGENT_BROWSER_EXECUTABLE_PATH` at an existing
Chrome or Chromium. For the full command reference matching that version, read
`agent-browser skills get core`.

## Rules

- The criteria are fixed. Never edit the spec, the criteria or the tests to make a
  check pass; change only the product code. If a criterion looks wrong or
  impossible, stop and say so: that is a question for the owner.
- Preview or local only, with test data and test payment modes. Never production,
  real accounts or live payments.
- At most three fix rounds. Then stop and report what still fails, with evidence.
- Evidence shows only what a person could do. Never change the page with scripts,
  injected styles or edited state to make a check pass or a recording look cleaner;
  if a state is hard to show, start a fresh page instead.

## Steps

1. **List the criteria.** With an approved spec, take every criterion of the
   journeys the change touches (`J3.S2.c1: …`), including the not allowed, bad
   input, failure and repeat cases. Without one, take the ticket's acceptance
   criteria and write them as `When <condition>: <result>.` Done when each
   criterion maps to a reproducible state and observation. Group checks that share
   a state so setup, navigation and screenshots run once. A focused pass names its
   subset; final acceptance covers the complete requested scope. For a design handoff, read
   [design coverage](references/design-coverage.md) and include each approved
   design in the same browser pass, with pinned source captures and a tested-code
   fingerprint. If the changed UI has a loading skeleton,
   include its transition to the loaded layout.

2. **Run the app.** If the team deploys a preview per branch, push the branch and
   wait for its URL; a preview behind Vercel login needs the bundled
   `protected-vercel-deployments` skill (`agent-browser skills get
   protected-vercel-deployments`). Otherwise start the app as `AGENTS.md` says.
   Done when the first screen loads.

3. **Check every criterion.** Give every path as an absolute path (see Known
   issues).
   ```sh
   app_url="http://localhost:3000"      # Use the URL of the running test app
   session="verify-$(basename "$PWD")-$$"
   out="$PWD/.verify/$session"; mkdir -p "$out"
   ab() { agent-browser --session "$session" "$@"; }
   ab open "$app_url"
   ab snapshot -i                       # elements by ref, e.g. @e3
   ab fill @e3 "500"; ab click @e2
   ab wait --text "Enter between"       # the criterion's expected result
   ab get text @e5                      # or read the value it names
   ab screenshot "$out/J3.S2.c2.png"
   ```
   Mark each criterion pass or fail against what the screen shows, with its
   shared state screenshot. On each changed screen, at each required device's viewport, run
   the read-only layout audit from this skill's directory and treat each issue
   as a failure (see [layout audit](references/layout-audit.md)):
   ```sh
   ab eval "$(bun scripts/layout-audit.ts --snippet)"
   ```
   To check a skeleton, trigger the real loading state, with the
   project's test delays or browser request controls, on a fresh load and on
   in-app navigation when both can show it. Capture it and the loaded state at
   the same viewport on each required device. Confirm the fallback shows while
   content is pending and leaves when it arrives, and compare stable regions
   such as headers, controls, rows and cards for unintended shifts. Report any
   fallback you could not reach. For design
   handoffs, review saved design/browser pairs for layout, typography, spacing,
   controls and content, then run the PNG coverage checker. A failed visual check
   is `differs` even if the interactions work. Use `--focus` for a partial pass;
   final acceptance uses the full scope manifest. Run the checker
   even if a state is blocked. Done when every criterion has a result.

4. **Fix and check again.** For each failure, find the cause in the code, fix it,
   run the affected tests, and recheck affected states and shared-component
   dependents. Batch fixes before the complete final capture at the current code
   fingerprint; do not relabel old evidence or rerun the full suite per small edit.
   Done when the requested pass succeeds, or after three rounds: then stop, skip the
   recording, and report each failing criterion with its screenshot and what you
   tried.

5. **Explore around it (risky changes only).** For money, permissions, customer
   data or a change crossing features, run agent-browser's bundled `dogfood` skill
   (`agent-browser skills get dogfood`) on the same app before recording, scoped
   to the changed area and the flows next to it, with output in `"$out/dogfood"`.
   Sort every finding:
   - **Caused by this change:** fix it within the same three rounds, then check
     affected states and shared-component dependents again.
   - **Behavior no criterion decides:** do not choose one; record it as an open
     question for the owner.
   - **There before this change:** do not fix it; list it as found, not fixed.
   Done when every finding is sorted.

6. **Record if requested.** After final acceptance, record one clean take of the
   main path and a failure case for the delivery. Reuse the state screenshots;
   recording is not a second acceptance pass. Skip this step during focused checks.
   ```sh
   ab record start "$out/walkthrough.mp4" --cursor --contact-sheet
   # …walk the approved main path and a failure case…
   ab record stop; ab close
   ```
   Rely on the screenshots, not the contact sheet (see Known issues). Keep the video
   under a minute.

7. **Hand it over.** Fill the PR's **Walkthrough** section with the requested video
   and one row per distinct state/device, linking its criteria and reused evidence.
   A focused pass reports its subset and remaining scope. For design handoffs, link
   the coverage report. For a risky change, fill
   **Exploratory check** with the dogfood report and the sorted findings. Attach the
   files where the team keeps PR media (see `AGENTS.md` or the team guide); if you
   cannot upload, give the person the file paths and the finished section to paste.

In your reply, say plainly what you changed in the code to make a criterion pass:
the person asked for a check and should not discover a fix in the diff.

The journey tests in CI then prove the same criteria on every push.

## Known issues in agent-browser 0.41.0

Check these again when moving to a newer version.

- A path starting with `.` (such as `.verify/…`) is read as a CSS selector, so the
  screenshot silently lands in agent-browser's temporary folder. Use absolute paths.
- Sessions are shared by name across every agent on the machine. Two agents both
  using `--session verify` drive the same browser: commands interleave, recordings
  land in the other's folder and one `close` ends both. Choose a unique session
  per run, reuse it across commands, and `close` only your own.
- The contact sheet keeps only a few frames and can skip a short-lived state such as
  an error message. Take a screenshot of every state instead.
