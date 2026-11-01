---
name: demo
description: Records a short video walkthrough of a UI change in a real browser, with screenshots of every state including failures, for the pull request. Use before opening a PR that changes what people see or do, or when asked to show that a feature works.
---

# Demo

You record proof that a change works, for the reviewer: a video of the changed
flow with a visible cursor, and a screenshot of each state it reaches. The reviewer
should see the main path **and** what happens when it goes wrong.

Use [agent-browser](https://github.com/vercel-labs/agent-browser), pinned:
`npx agent-browser@0.39.1`. Recording needs `ffmpeg`. If no browser is installed,
run `npx agent-browser@0.39.1 install`, or point
`AGENT_BROWSER_EXECUTABLE_PATH` at an existing Chrome or Chromium.

## Steps

1. **Pick what to show.** From the approved journeys if the change has a spec,
   otherwise from the diff: the main path, plus at least one failure the change
   handles (refused input, not allowed, a repeat). Write the list down first,
   one line per state. Done when every changed screen appears on it.

2. **Open the app.** Use the PR's preview URL, or start the dev server from
   `AGENTS.md`. Use test data and test payment modes only; never real accounts or
   live payments. Done when the first screen loads.

3. **Rehearse.** Run the whole list once without recording, using `snapshot -i` to
   find each element and checking each state appears. Fix the route or the data
   until every step works, so the recording does not show you searching. Done when
   one rehearsal passes start to end.

4. **Record.** Use one session name and save to `.demo/<branch>/`, which is not
   committed. Give every path as an absolute path: a path starting with `.` is
   read as a CSS selector, and the file silently lands elsewhere.
   ```sh
   ab="npx agent-browser@0.39.1 --session demo"
   out="$PWD/.demo/<branch>"; mkdir -p "$out"
   $ab open <url>
   $ab screenshot "$out/01-start.png"
   $ab record start "$out/walkthrough.mp4" --cursor --contact-sheet
   $ab snapshot -i            # find elements by ref, e.g. @e3
   $ab fill @e3 "500"; $ab click @e2
   $ab wait --text "Enter between"; $ab wait 1000
   $ab screenshot "$out/02-too-many-coins.png"
   ```
   After every action that changes the screen, wait until the new state shows
   (`wait`, or `wait --text "<expected text>"`), then take a numbered screenshot.
   Do not rely on the contact sheet: it keeps only some frames and can skip a
   short-lived error. If a step fails, stop the recording and go back to
   rehearsal. Then `$ab record stop` and `$ab close`.

5. **Check what you recorded.** Look at every screenshot. Each one must show the
   state its line names; an unexpected error or a blank screen is a finding, not
   a demo. If the feature does not behave as intended, stop and report it instead
   of attaching the recording. Done when each state on the list has a screenshot
   that shows it.

6. **Hand it over.** Fill the PR's **Walkthrough** section: one line per state with
   its screenshot, and the video. Attach the files where the team keeps PR media
   (see `docs/ai-workflow.md`); if you cannot upload, give the person the file paths
   and the finished Walkthrough text to paste. Done when the PR shows every state.

Keep it under a minute of video. A demo shows behavior; the journey tests in CI
prove it on every push.
