# Decision record

One file, normally `docs/decisions.md`. Each item is one line:
`- <ID> <status> — <text>`. The journeys checker reads these lines, and also table
rows with `ID`, `Status` and `Decision` columns, so an existing table record works
as it is. Keep each ID in one place. Everything else is free prose.

```markdown
# Invitations decisions

## Frame
- D1 accepted — Problem: admins add teammates by sharing one login.
- D2 accepted — Primary user: a workspace admin.
- D3 accepted — First usable outcome: the admin shares a link and the teammate joins.
- D4 accepted — Success signal: no shared logins a month after launch.
- X1 accepted — Email delivery is out of scope.

## Decisions
- D5 accepted — Only admins can invite. Why: membership is an admin power.
- D6 superseded — Links expire after 48 hours.
- D7 accepted — Links expire after 72 hours. Supersedes: D6
- D8 accepted — Failure default: the person sees a retryable error and no partial change is kept.
- D9 accepted — Accepted invites grant the member role.
- D10 accepted — Approved for build: invitations J1–J3.
- D11 draft — Assumed: the join page shows the inviter's name.

## Questions
- Q1 resolved — Answered by D9.
- Q2 open — Can an admin revoke a used link? A used link has already created a
  membership. Options: no; yes, which also removes the member. Recommend: no.
  Blocks: J2.S1. Owner: PM.
```

| Prefix | Meaning | Statuses |
|---|---|---|
| D | owner decision | draft, accepted, superseded, retired |
| X | non-goal or exclusion | draft, accepted, superseded, retired |
| Q | open product question | open, deferred, resolved, retired |

- **Frame** holds the five framing decisions for a new idea. Existing features skip it.
- **One rule per line**, under 30 words; a question under 60. **Why** is optional,
  a few words, only when the reason is not obvious. Link a ticket or doc for more.
- **Questions** are for choices you cannot make safely. Each reads on its own: the
  context an owner needs, the options, a recommendation, who answers (`Owner: PM`,
  or `Owner: unknown`) and optionally what it blocks (`Blocks: J2.S1`). A line may
  wrap; indent the continuation.
- **Draft** lines are proposals: your low-stakes assumptions and rules you inferred
  from an answer (`Assumed: …`), a
  proposed success signal or non-goal, or text the owner asked you to write up. They
  block `--ready` until the owner accepts them, usually all at once at Ready.
- **Changing a decision:** end the new line with `Supersedes: D6`. While the new line
  is a draft, D6 stays in force; on acceptance, mark D6 superseded. The checker then
  flags every step still citing D6. To replace part of a decision, restate the part
  that still holds in the new line.
- **Resolving a question:** shorten it to `- Q1 resolved — Answered by D9.`, listing
  every line the answer produced (`Answered by D21–D24, X3`); the decisions hold the
  content and git keeps the history. Journeys that cite Q1 then rest on all of them.
- **IDs are permanent:** retire a line instead of deleting or reusing its ID.
- **Approval** is the D line the owner accepts after the journeys Ready summary.
- **Observations** (what code does today) live in the journey file as O lines; link
  them from here if useful.
