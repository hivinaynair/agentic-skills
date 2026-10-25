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

## Questions
- Q1 resolved — Which role does an accepted invite grant? Recommend: member. Answered by D9.
- Q2 open — Can an admin revoke a used link? Recommend: no. Blocks: J2.S1. Owner: PM.
- Q3 open — Show the inviter's name on the join page? Recommend: yes. Default.
```

| Prefix | Meaning | Statuses |
|---|---|---|
| D | owner decision | draft, accepted, superseded, retired |
| X | non-goal or exclusion | draft, accepted, superseded, retired |
| Q | open product question | open, deferred, resolved, retired |

- **Frame** holds the five framing decisions for a new idea. Existing features skip it.
- **Why** is optional; add it when the reason is not obvious.
- **Questions** carry a recommendation, either `Blocks: <IDs>` (the answer changes
  the slice) or `Default` (safe to accept as recommended), and who answers
  (`Owner: PM`, or `Owner: unknown`). The owner can accept every default at once.
- **Draft** lines are for text the owner asked you to write up for confirmation.
- **Changing a decision:** end the new line with `Supersedes: D6`. While the new line
  is a draft, D6 stays in force; on acceptance, mark D6 superseded. The checker then
  flags every step still citing D6. To replace part of a decision, restate the part
  that still holds in the new line.
- **Resolving a question:** keep the question, mark it resolved and add
  `Answered by D9`. Journeys that cite Q1 then rest on D9 without renumbering.
- **IDs are permanent:** retire a line instead of deleting or reusing its ID.
- **Approval** is the D line the owner accepts after the journeys Ready summary.
- **Observations** (what code does today) live in the journey file as O lines; link
  them from here if useful.
