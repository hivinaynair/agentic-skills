# Examples

Synthetic features planned with the skills. No application was built for them.

- **[Password reset](password-reset/)**: a complete run, read in this order:
  1. [decisions.md](password-reset/decisions.md): the framed idea and the owner's decisions.
  2. [journeys/password-reset.md](password-reset/journeys/password-reset.md): what people
     see and do, with outcome checks, approved by D11.
  3. [tasks/password-reset.md](password-reset/tasks/password-reset.md): the build plan.
- **[Team invitations](team-invitations/)**: a spec that is not ready.
  [decisions.md](team-invitations/decisions.md) has four open questions, so
  [the journeys](team-invitations/journeys/invitations.md) fail `check --ready`.

```sh
bun skills/journeys/scripts/journeys.ts check examples/password-reset/journeys/password-reset.md --ready
bun skills/journeys/scripts/journeys.ts check examples/team-invitations/journeys/invitations.md --ready
```
