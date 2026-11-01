---
name: verify
description: Checks a change in a real browser against its success criteria, fixes and re-checks until every criterion passes (at most three rounds), explores around risky changes for unplanned bugs, then records a video walkthrough with a screenshot of every state for the pull request. Use after building a change people can see, before opening its PR, or when asked to verify or demo a feature.
---

# Verify

You prove a change works before a person looks at it: you check every success
criterion in a real browser, fix what fails, check again, and only then record
the walkthrough. The person reviews a change that already works, with evidence.

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

## Steps

1. **List the criteria.** With an approved spec, take every criterion of the
   journeys the change touches (`J3.S2.c1: …`), including the not allowed, bad
   input, failure and repeat cases. Without one, take the ticket's acceptance
   criteria and write them as `When <condition>: <result>.` Done when each
   criterion is one line you can check on screen.

2. **Run the app.** If the team deploys a preview per branch, push the branch and
   wait for its URL; a preview behind Vercel login needs the bundled
   `protected-vercel-deployments` skill (`agent-browser skills get
   protected-vercel-deployments`). Otherwise start the app as `AGENTS.md` says.
   Done when the first screen loads.

3. **Check every criterion.** Give every path as an absolute path: a path starting
   with `.` is read as a CSS selector and the file lands elsewhere.
   ```sh
   ab="agent-browser --session verify"
   out="$PWD/.verify/<branch>"; mkdir -p "$out"
   $ab open <url>
   $ab snapshot -i                      # elements by ref, e.g. @e3
   $ab fill @e3 "500"; $ab click @e2
   $ab wait --text "Enter between"      # the criterion's expected result
   $ab get text @e5                     # or read the value it names
   $ab screenshot "$out/J3.S2.c2.png"
   ```
   Mark each criterion pass or fail against what the screen shows, with its
   screenshot. Done when every criterion has a result.

4. **Fix and check again.** For each failure, find the cause in the code, fix it,
   run the project's tests, and check **every** criterion again, not only the one
   that failed. Done when all pass, or after three rounds: then stop, skip the
   recording, and report each failing criterion with its screenshot and what you
   tried.

5. **Explore around it (risky changes only).** For money, permissions, customer
   data or a change crossing features, run agent-browser's bundled `dogfood` skill
   (`agent-browser skills get dogfood`) on the same app before recording, scoped
   to the changed area and the flows next to it, with output in `"$out/dogfood"`.
   Sort every finding:
   - **Caused by this change:** fix it within the same three rounds, then check
     every criterion again.
   - **Behavior no criterion decides:** do not choose one; record it as an open
     question for the owner.
   - **There before this change:** do not fix it; list it as found, not fixed.
   Done when every finding is sorted.

6. **Record the walkthrough.** Once every criterion passes and every finding is
   sorted, record one clean take of the main path and at least one failure case,
   with a screenshot after each state; wait for each state to show before the
   screenshot.
   ```sh
   $ab record start "$out/walkthrough.mp4" --cursor --contact-sheet
   # …the same actions as step 3, screenshot after each state…
   $ab record stop; $ab close
   ```
   Do not rely on the contact sheet alone: it keeps only some frames and can skip
   a short-lived error. Keep the video under a minute.

7. **Hand it over.** Fill the PR's **Walkthrough** section: the video, then one
   line per criterion with its result and screenshot. For a risky change, fill
   **Exploratory check** with the dogfood report and the sorted findings. Attach the files where the
   team keeps PR media (see `docs/ai-workflow.md`); if you cannot upload, give the
   person the file paths and the finished section to paste.

The journey tests in CI then prove the same rules on every push.
