import {test, expect} from 'bun:test';
import {mkdtemp, rm, mkdir, writeFile, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, join, basename} from 'node:path';
import {parseJourneys, parseDecisions, validate, approvalHash, reviewPacket} from '../skills/journeys/scripts/journeys';

const decisionsMd = `# Invite decisions

## Decisions
- D1 accepted — Only admins can invite.
- D2 accepted — Failure default: show a retryable error and keep no partial change.
- D3 accepted — Approved for build: invite J1.
- X1 accepted — Email delivery is out of scope.

## Questions
- Q1 open — Which role does an accepted invite grant?
`;
const base = `# Invite

Decisions: decisions.md

## Actors
- admin: Workspace admin

## Goals
- C1 admin: Invite a member → J1
- C2 admin: Email the invite → excluded X1

## Invariants
- I1 (D1): THE SYSTEM SHALL NOT let non-admins create invites

## J1: Invite a teammate
Actor: admin · Exits: created, denied

Checks:
- denied: J1.S1.c2
- invalid: J1.S1.c3
- failed: D2
- repeated: n/a — each request creates a separate invite

### J1.S1 Submit the invite (person)
Screen: Members › Invite · Sees: invite form
Basis: D1 · Guards: I1
- c1: WHEN an admin submits a valid email THE SYSTEM SHALL create the invite
- c2: IF the requester is not an admin THE SYSTEM SHALL NOT create the invite
- c3: IF the email is malformed THE SYSTEM SHALL show a field error
→ J1.S2 when created
→ exit denied when not an admin

### J1.S2 Show the link (system)
Basis: D1
- c1: WHEN the invite is created THE SYSTEM SHALL show its link
→ exit created
`;
const approve = (md: string, id = 'D3', decisions = decisionsMd) => md.replace('Decisions: decisions.md\n', `Decisions: decisions.md\nApproved: ${id} ${approvalHash(parseJourneys(md).spec, parseDecisions(decisions).decisions)}\n`);
function result(md: string, ready = false, decisions = decisionsMd) {
  const p = parseJourneys(md), d = parseDecisions(decisions), r = validate(p.spec, d.decisions, ready);
  return {errors: [...p.errors, ...d.errors, ...r.errors].join('\n'), warnings: r.warnings, rules: r.rules, screens: r.screens};
}

test('valid file passes draft and, once approved, ready', () => {
  expect(result(base)).toMatchObject({errors: '', warnings: []});
  expect(result(base, true).errors).toContain('Not approved');
  const ready = result(approve(base), true);
  expect(ready.errors).toBe('');
  expect([...ready.rules]).toEqual(['I1', 'J1.S1.c1', 'J1.S1.c2', 'J1.S1.c3', 'J1.S2.c1']);
  expect(ready.screens.get('Members › Invite')).toEqual(['J1.S1']);
});

test.each([
  ['missing target', ['→ J1.S2 when created', '→ J1.S9 when created'], 'missing target J1.S9'],
  ['unreachable step', ['→ J1.S2 when created', '→ exit created when created'], 'J1.S2: unreachable'],
  ['cycle without exit', ['→ exit created\n', '→ J1.S2\n'], 'no path to an exit'],
  ['unlabeled branch', ['→ J1.S2 when created', '→ J1.S2'], 'needs a when'],
  ['unknown exit', ['→ exit created\n', '→ exit done\n'], 'unknown exit done'],
  ['unknown decision', ['Basis: D1 · Guards: I1', 'Basis: D9 · Guards: I1'], 'unknown decision D9'],
  ['missing basis', ['Basis: D1\n-', '\n-'], 'J1.S2: needs a Basis'],
  ['missing forbidden effect', ['- c2: IF the requester is not an admin THE SYSTEM SHALL NOT create the invite\n', ''], 'forbidden-effect'],
  ['unknown invariant', ['Guards: I1', 'Guards: I9'], 'unknown invariant I9'],
  ['duplicate step', ['### J1.S2 Show', '### J1.S1 Show'], 'Duplicate ID J1.S1'],
  ['wrong prefix', ['### J1.S2 Show', '### J2.S2 Show'], 'wrong journey prefix'],
  ['non-EARS criterion', ['THE SYSTEM SHALL show its link', 'show the link'], 'expected EARS'],
  ['person step without screen', ['Screen: Members › Invite · Sees: invite form\n', ''], 'person step needs a Screen'],
  ['unparsed bullet', ['→ exit created\n', '- remember this\n→ exit created\n'], 'cannot parse "- remember this"'],
  ['malformed step heading', ['(person)', '(user)'], 'cannot parse "### J1.S1'],
  ['key in wrong place', ['Actor: admin · Exits', 'Screen: X · Actor: admin · Exits'], 'Screen is not valid here'],
  ['unknown check ref', ['denied: J1.S1.c2', 'denied: J1.S1.c9'], 'unknown check ref J1.S1.c9'],
  ['unknown check', ['- failed: D2', '- failed: D2\n- typo: open — x'], 'unknown check typo'],
  ['n/a without reason', ['n/a — each request creates a separate invite', 'n/a'], 'n/a needs a reason'],
  ['retired ID reuse', ['Decisions: decisions.md', 'Decisions: decisions.md\nRetired: J1.S1.c1'], 'Retired ID reused: J1.S1.c1'],
  ['unknown actor', ['Actor: admin', 'Actor: ghost'], 'unknown actor ghost'],
  ['missing mapped journey', ['→ J1\n', '→ J1, J2\n'], 'missing mapped journey J2'],
  ['exclusion without X', ['excluded X1', 'excluded X9'], 'active X decision'],
  ['malformed goal target', ['excluded X1', 'skipped'], 'cannot parse "- C2'],
  ['malformed approval', ['Decisions: decisions.md', 'Decisions: decisions.md\nApproved: yes'], 'Approved is not valid here'],
])('%s fails', (_, [from, to], expected) => {
  const md = base.replace(from, to);
  expect(md).not.toBe(base);
  expect(result(md).errors).toContain(expected);
});

test('prose is ignored, a cycle with an exit is valid, and a single edge needs no when', () => {
  const md = base.replace('### J1.S2', 'Admins usually invite from the members page.\n\n### J1.S2')
    .replace('→ exit denied when not an admin', '→ exit denied when not an admin\n→ J1.S1 when retrying');
  expect(result(md).errors).toBe('');
});

test('open questions, missing or open checks and unresolved goals warn in draft and block ready', () => {
  const cases: [string, string, string][] = [
    ['Basis: D1\n-', 'Basis: D1, Q1\n-', 'Q1 is open; cited by J1.S2'],
    ['- failed: D2\n', '', 'J1: missing failed check'],
    ['- failed: D2', '- failed: open — waiting for Q1', 'J1/failed: check is open'],
    ['→ excluded X1', '→ excluded X1\n- C3 admin: Revoke an invite → unresolved: no policy yet', 'C3: unresolved goal'],
    ['- C1 admin: Invite a member → J1\n', '', 'J1: journey missing from Goals'],
  ];
  for (const [from, to, message] of cases) {
    const md = approve(base.replace(from, to));
    expect(result(md).errors).toBe('');
    expect(result(md).warnings).toContain(message);
    expect(result(md, true).errors).toContain(message);
  }
});

test('approval goes stale when structure changes but not when prose changes', () => {
  const approved = approve(base);
  expect(result(approved.replace('## Goals', 'Context paragraph.\n\n## Goals'), true).errors).toBe('');
  const changed = approved.replace('show its link', 'show its link and expiry');
  expect(result(changed).warnings.join()).toContain('Approval D3 is stale');
  expect(result(changed, true).errors).toContain('Approval D3 is stale');
  expect(result(approve(base, 'Q1'), true).errors).toContain('Not approved');
  expect(result(approve(base, 'D9'), true).errors).toContain('Approval D9 is not an accepted decision');
});

test('superseded decisions cannot support behavior', () => {
  const d = decisionsMd.replace('D1 accepted', 'D1 superseded') + '- D4 accepted — Only owners can invite. Supersedes: D1\n';
  expect(result(base, false, d).errors).toContain('inactive decision D1');
});

test.each([
  ['duplicate', '- D1 accepted — Changed.', 'duplicate decision D1'],
  ['bad supersession', '- D4 accepted — New. Supersedes: D9', 'supersedes unknown decision D9'],
  ['unmarked supersession', '- D4 accepted — New. Supersedes: D1', 'D1: mark replaced decision superseded'],
  ['resolved question pointing nowhere', '- Q2 resolved — Answered by D9.', 'Q2: answered by unknown decision D9'],
  ['invalid status', '- D4 approved — New.', 'D4 has invalid status approved'],
  ['question status on decision', '- D4 open — New.', 'D4 has invalid status open'],
])('decision record: %s fails', (_, line, expected) => {
  expect(parseDecisions(decisionsMd + line + '\n').errors.join('\n')).toContain(expected);
});

test('observations describe behavior but cannot authorize readiness', () => {
  const observed = base.replace('## Invariants', '## Observations\n- O1: The current route returns a link. Source: src/invite.ts@abc123 createInvite, lines 10-20\n\n## Invariants')
    .replace('Basis: D1\n-', 'Basis: O1\n-');
  expect(result(observed).errors).toBe('');
  expect(result(approve(observed), true).errors).toContain('J1.S2: observations are not approved policy');
  expect(result(observed.replace('@abc123 ', ' ')).errors).toContain('O1: each observation needs');
  expect(result(observed.replace('Basis: O1', 'Basis: O9')).errors).toContain('unknown observation O9');
});

test('a goal deleted from both the inventory and the graph is a semantic limit', () => {
  const second = base.replace('→ excluded X1', '→ excluded X1\n- C3 admin: Invite again → J2') + base.slice(base.indexOf('## J1')).replaceAll('J1', 'J2');
  expect(result(second)).toMatchObject({errors: '', warnings: []});
  const removed = second.replace('- C3 admin: Invite again → J2\n', '').slice(0, second.indexOf('## J2') - '- C3 admin: Invite again → J2\n'.length);
  expect(result(removed)).toMatchObject({errors: '', warnings: []});
  expect(result(base.replace(/## J1:[\s\S]*$/, '')).errors).toContain('Needs at least one');
});

const cli = resolve('skills/journeys/scripts/journeys.ts');
const hook = resolve('skills/journeys/scripts/pre-commit.sh');
const run = (cwd: string, ...cmd: string[]) => Bun.spawnSync(cmd, {cwd, stdout: 'pipe', stderr: 'pipe'});
async function project(prefix: string) {
  const dir = await mkdtemp(join(tmpdir(), prefix));
  await writeFile(join(dir, 'decisions.md'), decisionsMd);
  await writeFile(join(dir, 'feature.md'), base);
  return dir;
}

test('CLI approves only ready files and checks readiness', async () => {
  const dir = await project('journeys-cli-');
  try {
    expect(run(dir, 'bun', cli, 'check', 'missing.md').exitCode).not.toBe(0);
    const draft = run(dir, 'bun', cli, 'check', 'feature.md');
    expect(draft.exitCode).toBe(0);
    expect(draft.stdout.toString()).toContain('screens: Members › Invite (J1.S1)');
    expect(run(dir, 'bun', cli, 'check', 'feature.md', '--ready').exitCode).toBe(1);
    expect(run(dir, 'bun', cli, 'approve', 'feature.md', 'D9').stderr.toString()).toContain('accepted decision first');
    expect(run(dir, 'bun', cli, 'approve', 'feature.md', 'D3').exitCode).toBe(0);
    expect(await Bun.file(join(dir, 'feature.md')).text()).toContain(`Approved: D3 ${approvalHash(parseJourneys(base).spec, parseDecisions(decisionsMd).decisions)}`);
    expect(run(dir, 'bun', cli, 'check', 'feature.md', '--ready').exitCode).toBe(0);
    await writeFile(join(dir, 'feature.md'), (await Bun.file(join(dir, 'feature.md')).text()).replace('Basis: D1\n-', 'Basis: Q1\n-'));
    expect(run(dir, 'bun', cli, 'approve', 'feature.md', 'D3').stderr.toString()).toContain('Q1 is open; cited by J1.S2');
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('CLI caps warning output and can show all', async () => {
  const dir = await project('journeys-warnings-');
  try {
    const many = base.replace(/Checks:[\s\S]*?\n\n/, '') + base.slice(base.indexOf('## J1')).replaceAll('J1', 'J2').replace(/Checks:[\s\S]*?\n\n/, '')
      + base.slice(base.indexOf('## J1')).replaceAll('J1', 'J3').replace(/Checks:[\s\S]*?\n\n/, '');
    await writeFile(join(dir, 'feature.md'), many);
    const concise = run(dir, 'bun', cli, 'check', 'feature.md'), verbose = run(dir, 'bun', cli, 'check', 'feature.md', '--verbose');
    expect(concise.exitCode).toBe(0);
    expect(concise.stderr.toString().trim().split('\n')).toHaveLength(9);
    expect(concise.stderr.toString()).toContain('more warnings');
    expect(verbose.stderr.toString().trim().split('\n').length).toBeGreaterThan(9);
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('hook checks the staged snapshot, not the working tree', async () => {
  const dir = await project('journeys-hook-');
  try {
    expect(run(dir, 'git', 'init', '-q').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.').exitCode).toBe(0);
    await writeFile(join(dir, 'feature.md'), base.replace('→ J1.S2 when created', '→ J1.S9 when created'));
    expect(run(dir, 'sh', hook, 'feature.md').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', 'feature.md').exitCode).toBe(0);
    const result = run(dir, 'sh', hook, 'feature.md');
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain('missing target J1.S9');
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('repository-local hook runs the staged checker', async () => {
  const dir = await project('journeys-staged-tool-');
  try {
    const installed = join(dir, '.agents/skills/journeys/scripts');
    await mkdir(installed, {recursive: true});
    const localCli = join(installed, 'journeys.ts'), localHook = join(installed, 'pre-commit.sh');
    const source = await Bun.file(cli).text();
    await writeFile(localCli, source);
    await writeFile(localHook, await Bun.file(hook).text());
    expect(run(dir, 'git', 'init', '-q').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.').exitCode).toBe(0);
    await writeFile(localCli, 'process.exit(1);');
    expect(run(dir, 'sh', localHook, 'feature.md').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.agents').exitCode).toBe(0);
    await writeFile(localCli, source);
    expect(run(dir, 'sh', localHook, 'feature.md').exitCode).not.toBe(0);
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('hook rejects feature paths outside the repository', async () => {
  const dir = await project('journeys-hook-paths-');
  try {
    expect(run(dir, 'git', 'init', '-q').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.').exitCode).toBe(0);
    for (const path of [join(dir, 'feature.md'), '../feature.md', 'docs/../../feature.md']) {
      const result = run(dir, 'sh', hook, path);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toString()).toContain('repository-relative');
    }
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test.each(['feature-directory-symlink', 'absolute-decisions', 'traversal-decisions', 'decision-symlink', 'checker-symlink'])(
  'hook rejects %s after resolving staged paths', async kind => {
    const dir = await mkdtemp(join(tmpdir(), 'journeys-read-boundary-'));
    try {
      const repo = join(dir, 'repo'), outside = join(dir, 'outside');
      await mkdir(repo); await mkdir(outside);
      let md = base, path = 'feature.md', selectedHook = hook;
      await writeFile(join(repo, 'decisions.md'), decisionsMd);
      await writeFile(join(outside, 'decisions.md'), decisionsMd);
      if (kind === 'feature-directory-symlink') {
        await writeFile(join(outside, 'feature.md'), base);
        await symlink(outside, join(repo, 'current'), 'dir');
        path = 'current/feature.md';
      }
      if (kind === 'absolute-decisions') md = base.replace('Decisions: decisions.md', `Decisions: ${join(outside, 'decisions.md')}`);
      if (kind === 'traversal-decisions') md = base.replace('Decisions: decisions.md', `Decisions: ../${basename(dir)}/outside/decisions.md`);
      if (kind === 'decision-symlink') {
        await rm(join(repo, 'decisions.md'));
        await symlink(join(outside, 'decisions.md'), join(repo, 'decisions.md'));
      }
      if (kind === 'checker-symlink') {
        const scripts = join(repo, 'scripts'); await mkdir(scripts);
        await writeFile(join(scripts, 'pre-commit.sh'), await Bun.file(hook).text());
        await writeFile(join(outside, 'journeys.ts'), 'process.exit(0);');
        await symlink(join(outside, 'journeys.ts'), join(scripts, 'journeys.ts'));
        selectedHook = join(scripts, 'pre-commit.sh');
      }
      await writeFile(join(repo, 'feature.md'), md);
      expect(run(repo, 'git', 'init', '-q').exitCode).toBe(0);
      expect(run(repo, 'git', 'add', '.').exitCode).toBe(0);
      const result = run(repo, 'sh', selectedHook, path);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toString()).toContain('escapes staged snapshot');
    } finally { await rm(dir, {recursive: true, force: true}); }
  });

test('hook permits references and symlinks inside the staged snapshot', async () => {
  const dir = await project('journeys-contained-');
  try {
    await mkdir(join(dir, 'config'));
    await symlink('../decisions.md', join(dir, 'config/decisions.md'));
    await writeFile(join(dir, 'feature.md'), base.replace('Decisions: decisions.md', 'Decisions: config/decisions.md'));
    expect(run(dir, 'git', 'init', '-q').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.').exitCode).toBe(0);
    const result = run(dir, 'sh', hook, 'feature.md');
    expect(result.stderr.toString()).toBe('');
    expect(result.exitCode).toBe(0);
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('examples: password reset is ready; invitations stays blocked on open questions', () => {
  const check = (path: string, ...flags: string[]) => run('.', 'bun', cli, 'check', path, ...flags);
  expect(check('examples/password-reset/journeys/password-reset.md', '--ready').exitCode).toBe(0);
  const invitations = check('examples/team-invitations/journeys/invitations.md', '--ready');
  expect(invitations.exitCode).toBe(1);
  expect(invitations.stderr.toString()).toContain('Q1 is open; cited by J3.S4');
});

test('draft citations are grouped per decision, and question-only basis gets a precise message', () => {
  const md = base.replace('Basis: D1 · Guards: I1', 'Basis: D1, Q1 · Guards: I1').replace('Basis: D1\n-', 'Basis: Q1\n-')
    .replace('- I1 (D1):', '- I1 (D1, Q1):');
  const r = result(md);
  expect(r.warnings).toEqual(['Q1 is open; cited by I1, J1.S1, J1.S2']);
  expect(result(approve(md), true).errors).toContain('J1.S2: needs an accepted decision in Basis');
});

const tableDecisions = `# Decisions

| ID | Status | Decision | Why | Supersedes |
|---|---|---|---|---|
| D1 | accepted | Only admins can invite | Admin power | |
| D2 | accepted | Failure default: retryable error, no partial change | | |
| X1 | accepted | Email delivery is out of scope | | |

- D89/X4 override notes are prose, not decision lines.
- D1 label: also prose.
- D3 accepted — Approved for build: invite J1.
- Q1 open — Which role does an accepted invite grant?
`;

test('table rows and line items both count as decisions; ID-led prose bullets are ignored', () => {
  const d = parseDecisions(tableDecisions);
  expect(d.errors).toEqual([]);
  expect([...d.decisions.keys()]).toEqual(['D1', 'D2', 'X1', 'D3', 'Q1']);
  expect(result(approve(base, 'D3', tableDecisions), true, tableDecisions).errors).toBe('');
  expect(parseDecisions(tableDecisions + '- D1 accepted — Restated.\n').errors.join()).toContain('duplicate decision D1');
});

test('a draft replacement may name what it supersedes; acceptance requires the old one superseded', () => {
  expect(parseDecisions(decisionsMd + '- D4 draft — Owners can invite too. Supersedes: D1\n').errors).toEqual([]);
  expect(parseDecisions(decisionsMd + '- D4 accepted — Owners can invite too. Supersedes: D1\n').errors).toContain('D1: mark replaced decision superseded');
});

test('a resolved question cited in Basis follows its answer', () => {
  const answered = decisionsMd.replace('- Q1 open — Which role does an accepted invite grant?', '- Q1 resolved — Which role does an accepted invite grant? Answered by D4.\n- D4 accepted — Accepted invites grant the member role.');
  const md = base.replace('Basis: D1\n-', 'Basis: Q1\n-');
  expect(result(approve(md, 'D3', answered), true, answered).errors).toBe('');
  const unanswered = decisionsMd.replace('Q1 open — Which role does an accepted invite grant?', 'Q1 resolved — Settled in chat.');
  expect(result(md, false, unanswered).errors).toContain('J1.S2: Q1 is resolved; add "Answered by D<n>" to it');
});

test('approval goes stale when a cited decision changes, not when an uncited one does', () => {
  const approved = approve(base);
  expect(result(approved, true, decisionsMd.replace('Only admins can invite.', 'Admins and owners can invite.')).errors).toContain('Approval D3 is stale');
  expect(result(approved, true, decisionsMd + '- D9 accepted — Unrelated rule.\n').errors).toBe('');
});

test.each([
  ['screen', 'Screen: Members › Invite', 'Screen: Members › Add'],
  ['what the person sees', 'Sees: invite form', 'Sees: invite form and help'],
  ['goal text', 'Invite a member', 'Invite a teammate'],
  ['check answer', '- invalid: J1.S1.c3', '- invalid: J1.S1.c1'],
  ['branch condition', 'when created', 'when the invite is created'],
  ['exit name', 'Exits: created, denied', 'Exits: created, denied, blocked'],
])('approval goes stale when the %s changes', (_, from, to) => {
  const changed = approve(base).replace(from, to);
  expect(changed).not.toBe(approve(base));
  expect(result(changed, true).errors).toContain('Approval D3 is stale');
});

test('goals covered by another spec do not block ready but need a reason', () => {
  const md = approve(base.replace('→ excluded X1', '→ excluded X1\n- C3 admin: Revoke an invite → elsewhere: docs/journeys/members.md J4'));
  expect(result(md, true).errors).toBe('');
  expect(result(base.replace('→ excluded X1', '→ excluded X1\n- C3 admin: Revoke → elsewhere')).errors).toContain('C3: elsewhere goal needs a reason');
});

test('parser accepts common variants: -> arrows, * bullets, en dashes and none', () => {
  const md = base.replace('→ J1.S2 when created', '-> J1.S2 when created').replace('- c1: WHEN the invite', '* c1: WHEN the invite')
    .replace('n/a — each', 'n/a – each').replace('Basis: D1\n-', 'Basis: D1 · Guards: none\n-');
  expect(result(md)).toMatchObject({errors: '', warnings: []});
});

test('a step can name several screens', () => {
  const r = result(base.replace('Screen: Members › Invite', 'Screen: Members › Invite; Settings › Team'));
  expect([...r.screens.keys()]).toEqual(['Members › Invite', 'Settings › Team']);
});

test('open decisions are listed before other warnings', () => {
  const r = result(base.replace('- failed: D2\n', '').replace('Basis: D1\n-', 'Basis: D1, Q1\n-'));
  expect(r.warnings[0]).toStartWith('Q1 is open');
});

test('the format examples in the skill references pass the checker together', async () => {
  const fenced = async (path: string) => (await Bun.file(path).text()).match(/```markdown\n([\s\S]*?)```/)![1];
  const decisions = parseDecisions(await fenced('skills/decide/references/record-format.md'));
  const journeys = parseJourneys((await fenced('skills/journeys/references/format.md')).replace(/^Decisions:.*$/m, 'Decisions: decisions.md'));
  expect(decisions.errors).toEqual([]);
  expect(journeys.errors).toEqual([]);
  expect(validate(journeys.spec, decisions.decisions).errors).toEqual([]);
});

test('CLI rejects misuse with clear messages and marks every error line', async () => {
  const dir = await project('journeys-misuse-');
  try {
    const stderr = (...args: string[]) => run(dir, 'bun', cli, ...args).stderr.toString();
    expect(stderr('check', 'feature.md', '--strict')).toContain('Unknown option --strict');
    expect(stderr('approve', 'feature.md')).toContain('Usage');
    expect(stderr('approve', 'feature.md', 'D3', 'D4')).toContain('Usage');
    expect(stderr('check', 'feature.yaml')).toContain('retired YAML format');
    await writeFile(join(dir, 'feature.md'), base.replace('→ J1.S2 when created', '→ J1.S9 when created').replace('Guards: I1', 'Guards: I9'));
    const lines = stderr('check', 'feature.md').trim().split('\n');
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every(l => l.startsWith('ERROR: '))).toBe(true);
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('approve replaces an existing stamp and leaves the rest of the file untouched', async () => {
  const dir = await project('journeys-restamp-');
  try {
    await writeFile(join(dir, 'feature.md'), base.replace('Decisions: decisions.md', 'Decisions: decisions.md\nApproved: D3 00000000'));
    expect(run(dir, 'bun', cli, 'approve', 'feature.md', 'D3').exitCode).toBe(0);
    const text = await Bun.file(join(dir, 'feature.md')).text();
    expect(text.match(/^Approved:/gm)).toHaveLength(1);
    expect(text.replace(/^Approved: .*\n/m, '')).toBe(base);
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('hook passes --ready through to the checker', async () => {
  const dir = await project('journeys-hook-ready-');
  try {
    expect(run(dir, 'git', 'init', '-q').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.').exitCode).toBe(0);
    expect(run(dir, 'sh', hook, 'feature.md').exitCode).toBe(0);
    const ready = run(dir, 'sh', hook, 'feature.md', '--ready');
    expect(ready.exitCode).toBe(1);
    expect(ready.stderr.toString()).toContain('Not approved');
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('tables without a Status column are prose; answer tables resolve questions', () => {
  const extra = '\n| ID | Note |\n|---|---|\n| D1 | crosswalk row |\n\n| ID | Status | Answer |\n|---|---|---|\n| Q7 | resolved | D1: only admins invite |\n';
  const d = parseDecisions(decisionsMd + extra);
  expect(d.errors).toEqual([]);
  expect(d.decisions.get('Q7')).toMatchObject({status: 'resolved', answer: 'D1'});
});

test('Scope requires every accepted decision in it to be cited; ranges expand', () => {
  const scoped = (scope: string) => base.replace('Decisions: decisions.md\n', `Decisions: decisions.md\nScope: ${scope}\n`);
  expect(result(scoped('D1–D2, X1'))).toMatchObject({errors: '', warnings: []});
  const extra = decisionsMd + '- D4 accepted — Invites show the inviter name.\n';
  expect(result(scoped('D1-D4'), false, extra).warnings).toContain('Scope: D4 is accepted but no goal, step, invariant or check cites it');
  expect(result(approve(scoped('D1-D4'), 'D3', extra), true, extra).errors).toContain('Scope: D4 is accepted but no goal, step, invariant or check cites it');
  expect(result(approve(scoped('D1–D3'), 'D3'), true).errors).toBe('');
  expect(result(scoped('D1, D99')).errors).toContain('Scope: unknown decision D99');
});

test('a criterion with more than one SHALL is flagged for splitting', () => {
  const md = base.replace('THE SYSTEM SHALL show its link', 'THE SYSTEM SHALL show its link and SHALL copy it');
  expect(result(md).warnings).toContain('J1.S2.c1: more than one SHALL; split it into one behavior per criterion');
});

test('review packet lays each step beside the text it rests on', () => {
  const answered = decisionsMd.replace('- Q1 open — Which role does an accepted invite grant?', '- Q1 resolved — Which role does an accepted invite grant? Answered by D4.\n- D4 accepted — Accepted invites grant the member role.');
  const packet = reviewPacket(parseJourneys(base.replace('Basis: D1\n-', 'Basis: Q1\n-')).spec, parseDecisions(answered).decisions);
  expect(packet).toContain('### J1.S1 Submit the invite (person)\nRests on:\n- D1 (accepted): Only admins can invite.');
  expect(packet).toContain('Guards:\n- I1 (invariant): THE SYSTEM SHALL NOT let non-admins create invites');
  expect(packet).toContain('- Q1 (resolved): Which role does an accepted invite grant? Answered by D4.\n  - D4 (accepted): Accepted invites grant the member role.');
  expect(packet).toContain('- failed: \n  - D2 (accepted): Failure default');
  expect(packet).toContain('- repeated: n/a — each request creates a separate invite');
});

test('CLI prints the review packet', async () => {
  const dir = await project('journeys-review-');
  try {
    const review = run(dir, 'bun', cli, 'check', 'feature.md', '--review');
    expect(review.exitCode).toBe(0);
    expect(review.stdout.toString()).toStartWith('# Review: Invite');
  } finally { await rm(dir, {recursive: true, force: true}); }
});
