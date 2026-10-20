import {test, expect} from 'bun:test';
import {mkdtemp, rm, mkdir, writeFile, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, join, basename} from 'node:path';
import {validate, decisionsFrom, render, risks, verificationProblems} from '../skills/journeys/scripts/journeys';
const decisionText = '| ID | Status | Decision | Supersedes |\n|---|---|---|---|\n| D1 | accepted | Admins can invite | |\n| Q1 | open | Which role? | |';
const decisions = decisionsFrom(decisionText);
function fixture(): any {
  return {coverage: [{id: "C1", actor: "admin", goal: "Invite a member", status: "mapped", journeys: ["J1"]}], version: 1, feature: 'invite', decisions: 'decisions.md', retired: [], actors: [{id: 'admin', name: 'Admin'}], invariants: [{id: 'I1', rule: 'THE SYSTEM SHALL NOT grant unauthorized access', decisions: ['D1']}], journeys: [{id: 'J1', title: 'Invite', actor: 'admin', entry: 'J1.S1', exits: ['done', 'denied'], steps: [{id: 'J1.S1', title: 'Authorize', kind: 'system', decisions: ['D1'], invariants: ['I1'], criteria: {c1: 'WHEN authorized THE SYSTEM SHALL create an invite', c2: 'IF unauthorized THE SYSTEM SHALL NOT create an invite'}, next: [{to: 'J1.S2', when: 'authorized'}, {exit: 'denied', when: 'unauthorized'}]}, {id: 'J1.S2', title: 'Finish', kind: 'system', decisions: ['D1'], invariants: [], criteria: {c1: 'WHEN created THE SYSTEM SHALL return the link'}, exit: 'done'}], review: Object.fromEntries(risks.map(r => [r, {status: 'covered', reason: 'Synthetic validator fixture', refs: ['J1.S1']}]))}]};
}
const errors = (s: any, ready = false) => validate(s, decisions, ready).errors.join('\n');
test('valid connected journey passes and renders every criterion', () => {
  const s = fixture(); expect(errors(s, true)).toBe('');
  expect(render(s)).toContain('J1.S1.c2'); expect(render(s)).toContain('flowchart TD');
});
test.each([
  ['missing branch target', (s: any) => s.journeys[0].steps[0].next[0].to = 'J1.S99', 'missing target'],
  ['unreachable step', (s: any) => s.journeys[0].steps[0].next[0] = {exit: 'done', when: 'authorized'}, 'unreachable'],
  ['cycle without exit', (s: any) => {s.journeys[0].steps[1].next = [{to: 'J1.S2', when: 'again'}]; delete s.journeys[0].steps[1].exit;}, 'no path to an exit'],
  ['unlabeled branch', (s: any) => delete s.journeys[0].steps[0].next[0].when, 'each edge needs'],
  ['unknown decision', (s: any) => s.journeys[0].steps[0].decisions = ['D99'], 'unknown decision'],
  ['retired ID reuse', (s: any) => s.retired = ['J1.S1.c1'], 'Retired ID reused'],
  ['missing negative case', (s: any) => delete s.journeys[0].steps[0].criteria.c2, 'forbidden-effect'],
  ['unknown invariant', (s: any) => s.journeys[0].steps[0].invariants = ['I99'], 'unknown invariant'],
  ['double termination', (s: any) => s.journeys[0].steps[0].exit = 'done', 'choose exactly one'],
  ['duplicate step ID', (s: any) => s.journeys[0].steps.push({...s.journeys[0].steps[1]}), 'Duplicate ID'],
  ['malformed criteria', (s: any) => s.journeys[0].steps[0].criteria = ['hello'], 'criteria must'],
  ['false review reference', (s: any) => s.journeys[0].review.permissions.refs = ['J1.S99'], 'unknown review ref'],
  ['invalid task target', (s: any) => s.tasks = [{id:'T1', serves:['J1.S9']}], 'unknown served step'],
])('%s fails', (_, mutate, expected) => { const s = fixture(); mutate(s); expect(errors(s)).toContain(expected); });
test('cycle with an exit is permitted', () => { const s = fixture(); s.journeys[0].steps[0].next.push({to: 'J1.S1', when: 'retry'}); expect(errors(s)).toBe(''); });
test('unresolved policy is allowed in draft and blocks ready', () => { const s = fixture(); s.journeys[0].steps[1].decisions = ['Q1']; expect(errors(s)).toBe(''); expect(errors(s, true)).toContain('unresolved policy Q1'); });
test('missing and open branch reviews block ready', () => { const s = fixture(); delete s.journeys[0].review; expect(errors(s)).toBe(''); expect(errors(s, true)).toContain('missing permissions'); s.journeys[0].review = {permissions: {status:'open', reason:'Owner has not decided'}}; expect(errors(s,true)).toContain('review remains open'); });
test('superseded decisions cannot support active behavior', () => {
  const d = decisionsFrom(decisionText.replace('| D1 | accepted', '| D1 | superseded') + '\n| D2 | accepted | Only owners invite | D1 |');
  expect(validate(fixture(), d).errors.join()).toContain('inactive decision D1');
});
test('duplicate decision rows and bad supersession fail', () => {
  expect(() => decisionsFrom(decisionText + '\n| D1 | accepted | Changed | |')).toThrow('Duplicate');
  expect(() => decisionsFrom(decisionText + '\n| D2 | accepted | Changed | D99 |')).toThrow('invalid superseded');
});
test.each([null, [], 'string', {version:1, feature:'bad', decisions:'x', retired:[], actors:[null], invariants:[null], journeys:[null]}].map(value => [value]))('malformed input reports errors without crashing: %j', s => expect(validate(s,decisions).errors.length).toBeGreaterThan(0));
test('verification checks file and locator existence, not test execution', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'journeys-map-'));
  try {
    await writeFile(join(dir,'test.py'), 'def test_admin_invites(): pass');
    const rules = new Set(['J1.S1.c1']);
    expect(await verificationProblems({'J1.S1.c1':[{path:'test.py',locator:'test_admin_invites'}]},dir,rules,true)).toEqual([]);
    expect((await verificationProblems({'J1.S1.c1':[{path:'test.py',locator:'missing'}]},dir,rules,true)).join()).toContain('missing locator');
    expect((await verificationProblems({},dir,rules,true)).join()).toContain('Missing verification');
    expect((await verificationProblems({'I99':[{path:'missing',locator:'x'}]},dir,rules,false)).join()).toContain('Unknown verification');
  } finally { await rm(dir,{recursive:true,force:true}); }
});
const cli = resolve('skills/journeys/scripts/journeys.ts');
const hook = resolve('skills/journeys/scripts/pre-commit.sh');
function run(cwd: string, ...cmd: string[]) { return Bun.spawnSync(cmd,{cwd,stdout:'pipe',stderr:'pipe'}); }
test('CLI rejects missing files and stale rendering; hook checks staged snapshot', async () => {
  const dir = await mkdtemp(join(tmpdir(),'journeys-hook-'));
  try {
    await writeFile(join(dir,'decisions.md'), decisionText);
    await writeFile(join(dir,'feature.yaml'), Bun.YAML.stringify(fixture()));
    expect(run(dir,'bun',cli,'check','missing.yaml').exitCode).not.toBe(0);
    expect(run(dir,'bun',cli,'render','feature.yaml').exitCode).toBe(0);
    expect(run(dir,'bun',cli,'check','feature.yaml','--ready').exitCode).toBe(0);
    expect(run(dir,'git','init','-q').exitCode).toBe(0);
    expect(run(dir,'git','add','.').exitCode).toBe(0);
    const broken = fixture(); broken.journeys[0].steps[0].next[0].to = 'J1.S99';
    await writeFile(join(dir,'feature.yaml'), Bun.YAML.stringify(broken));
    expect(run(dir,'sh',hook,'feature.yaml','--ready').exitCode).toBe(0); // unstaged break not committed
    expect(run(dir,'git','add','feature.yaml').exitCode).toBe(0);
    expect(run(dir,'sh',hook,'feature.yaml','--ready').exitCode).not.toBe(0);
    await writeFile(join(dir,'feature.yaml'),Bun.YAML.stringify(fixture()));
    await writeFile(join(dir,'feature.md'),'stale');
    expect(run(dir,'bun',cli,'check','feature.yaml').exitCode).not.toBe(0);
  } finally { await rm(dir,{recursive:true,force:true}); }
});

test('repository-local hook runs the staged validator, including when an unstaged copy would pass', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'journeys-staged-tool-'));
  try {
    const installed = join(dir, '.agents/skills/journeys/scripts');
    await mkdir(installed, {recursive:true});
    const localCli = join(installed, 'journeys.ts');
    const localHook = join(installed, 'pre-commit.sh');
    const validatorSource = await Bun.file(cli).text();
    await writeFile(localCli, validatorSource);
    await writeFile(localHook, await Bun.file(hook).text());
    await writeFile(join(dir, 'decisions.md'), decisionText);
    await writeFile(join(dir, 'feature.yaml'), Bun.YAML.stringify(fixture()));
    expect(run(dir, 'git', 'init', '-q').exitCode).toBe(0);
    expect(run(dir, 'bun', localCli, 'render', 'feature.yaml').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.').exitCode).toBe(0);
    expect(run(dir, 'sh', localHook, 'feature.yaml', '--ready').exitCode).toBe(0);
    await writeFile(localCli, 'process.exit(1);');
    expect(run(dir, 'sh', localHook, 'feature.yaml', '--ready').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.agents').exitCode).toBe(0);
    await writeFile(localCli, validatorSource);
    expect(run(dir, 'sh', localHook, 'feature.yaml', '--ready').exitCode).not.toBe(0);
    expect(run(dir, 'git', 'add', '.agents').exitCode).toBe(0);
    const broken = fixture(); broken.journeys[0].steps[0].next[0].to = 'J1.S99';
    await writeFile(join(dir, 'feature.yaml'), Bun.YAML.stringify(broken));
    expect(run(dir, 'git', 'add', 'feature.yaml').exitCode).toBe(0);
    await writeFile(localCli, 'process.exit(0);');
    const result = run(dir, 'sh', localHook, 'feature.yaml', '--ready');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.toString()).toContain('missing target J1.S99');
  } finally { await rm(dir, {recursive:true, force:true}); }
});

test('hook rejects feature and verification paths that bypass the staged snapshot', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'journeys-hook-paths-'));
  try {
    expect(run(dir, 'git', 'init', '-q').exitCode).toBe(0);
    await writeFile(join(dir, 'feature.yaml'), Bun.YAML.stringify(fixture()));
    await writeFile(join(dir, 'decisions.md'), decisionText);
    expect(run(dir, 'bun', cli, 'render', 'feature.yaml').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.').exitCode).toBe(0);
    for (const args of [
      [join(dir, 'feature.yaml')], ['../feature.yaml'], ['docs/../../feature.yaml'],
      ['feature.yaml', '--verification', join(dir, 'verification.json')],
      ['feature.yaml', '--verification', '../verification.json'],
    ]) {
      const result = run(dir, 'sh', hook, ...args);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toString()).toContain('repository-relative paths');
    }
  } finally { await rm(dir, {recursive:true, force:true}); }
});

const escapingInputs = [
  'feature-directory-symlink', 'absolute-decisions', 'traversal-decisions', 'decision-symlink',
  'verification-map-symlink', 'absolute-verification-link', 'traversal-verification-link',
  'verification-link-symlink', 'rendered-markdown-symlink', 'validator-symlink',
];
test.each(escapingInputs)('hook rejects %s after resolving the staged paths', async (kind) => {
  const dir = await mkdtemp(join(tmpdir(), 'journeys-read-boundary-'));
  try {
    const repo = join(dir, 'repo'), outside = join(dir, 'outside');
    await mkdir(repo); await mkdir(outside);
    const s = fixture();
    const args = ['feature.yaml', '--ready'];
    let selectedHook = hook;
    await writeFile(join(repo, 'decisions.md'), decisionText);
    await writeFile(join(outside, 'decisions.md'), decisionText);
    await writeFile(join(outside, 'test.ts'), 'test_admin_invites');
    if (kind === 'feature-directory-symlink') {
      await writeFile(join(outside, 'feature.yaml'), Bun.YAML.stringify(s));
      await writeFile(join(outside, 'feature.md'), render(s));
      await symlink(outside, join(repo, 'current'), 'dir');
      args[0] = 'current/feature.yaml';
    }
    if (kind === 'absolute-decisions') s.decisions = join(outside, 'decisions.md');
    if (kind === 'traversal-decisions') s.decisions = `../${basename(dir)}/outside/decisions.md`;
    if (kind === 'decision-symlink') {
      await rm(join(repo, 'decisions.md'));
      await symlink(join(outside, 'decisions.md'), join(repo, 'decisions.md'));
    }
    if (kind.includes('verification')) {
      let linkPath = 'test.ts';
      if (kind === 'absolute-verification-link') linkPath = join(outside, 'test.ts');
      if (kind === 'traversal-verification-link') linkPath = `../${basename(dir)}/outside/test.ts`;
      const map = JSON.stringify({'J1.S1.c1':[{path:linkPath, locator:'test_admin_invites'}]});
      if (kind === 'verification-map-symlink') {
        await writeFile(join(outside, 'verification.json'), map);
        await symlink(join(outside, 'verification.json'), join(repo, 'verification.json'));
      } else await writeFile(join(repo, 'verification.json'), map);
      if (kind === 'verification-link-symlink') await symlink(join(outside, 'test.ts'), join(repo, 'test.ts'));
      args.push('--verification', 'verification.json');
    }
    await writeFile(join(repo, 'feature.yaml'), Bun.YAML.stringify(s));
    if (kind === 'rendered-markdown-symlink') {
      await writeFile(join(outside, 'feature.md'), render(s));
      await symlink(join(outside, 'feature.md'), join(repo, 'feature.md'));
    } else await writeFile(join(repo, 'feature.md'), render(s));
    if (kind === 'validator-symlink') {
      const scripts = join(repo, 'scripts'); await mkdir(scripts);
      await writeFile(join(scripts, 'pre-commit.sh'), await Bun.file(hook).text());
      await writeFile(join(outside, 'journeys.ts'), 'process.exit(0);');
      await symlink(join(outside, 'journeys.ts'), join(scripts, 'journeys.ts'));
      selectedHook = join(scripts, 'pre-commit.sh');
    }
    expect(run(repo, 'git', 'init', '-q').exitCode).toBe(0);
    expect(run(repo, 'git', 'add', '.').exitCode).toBe(0);
    const result = run(repo, 'sh', selectedHook, ...args);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.toString()).toContain('escapes staged snapshot');
  } finally { await rm(dir, {recursive:true, force:true}); }
});

test('hook permits references and symlinks contained within the staged snapshot', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'journeys-contained-links-'));
  try {
    const s = fixture(); s.decisions = 'config/decisions.md';
    await mkdir(join(dir, 'config'));
    await mkdir(join(dir, 'checks'));
    await writeFile(join(dir, 'decisions.md'), decisionText);
    await symlink('../decisions.md', join(dir, 'config/decisions.md'));
    await writeFile(join(dir, 'checks/test.ts'), 'test_admin_invites');
    await symlink('checks/test.ts', join(dir, 'test.ts'));
    await writeFile(join(dir, 'verification.json'), JSON.stringify({'J1.S1.c1':[{path:'test.ts',locator:'test_admin_invites'}]}));
    await writeFile(join(dir, 'feature.yaml'), Bun.YAML.stringify(s));
    await writeFile(join(dir, 'feature.md'), render(s));
    expect(run(dir, 'git', 'init', '-q').exitCode).toBe(0);
    expect(run(dir, 'git', 'add', '.').exitCode).toBe(0);
    const result = run(dir, 'sh', hook, 'feature.yaml', '--ready', '--verification', 'verification.json');
    expect(result.stderr.toString()).toBe('');
    expect(result.exitCode).toBe(0);
  } finally { await rm(dir, {recursive:true, force:true}); }
});

test('policy readiness allows unfinished engineering but rejects unresolved policy and coverage', () => {
  const s = fixture();
  s.journeys[0].review.concurrency = {status:'open', reason:'Builder must specify transaction boundary under D1'};
  const policy = () => validate(s, decisions, false, false, true);
  expect(policy().errors).toEqual([]);
  expect(policy().warnings).toContain('J1/concurrency: review remains open');
  expect(validate(s, decisions, true).errors).toContain('J1/concurrency: review remains open');
  s.journeys[0].steps[1].decisions = ['Q1'];
  expect(policy().errors).toContain('J1.S2: unresolved policy Q1');
  s.journeys[0].steps[1].decisions = ['D1'];
  s.coverage.push({id:'C2',actor:'admin',goal:'Accept invitation',status:'unresolved',reason:'Recipient policy missing'});
  expect(policy().errors).toContain('C2: unresolved coverage');
});

test('policy readiness cannot promote observations or an unsupported exclusion', () => {
  const s = fixture();
  s.observations = [{id:'O1',statement:'Current route returns a link',sources:[{ref:'route.ts',revision:'abc',locator:'create'}]}];
  s.journeys[0].steps[1].decisions = [];
  s.journeys[0].steps[1].observations = ['O1'];
  expect(validate(s, decisions, false, false, true).errors.join()).toContain('not approved policy');
  s.coverage.push({id:'C2',actor:'admin',goal:'Email invitation',status:'excluded',reason:'Not implemented'});
  expect(validate(s, decisions, false, false, true).errors).toContain('C2: exclusion needs an accepted X decision');
});

test('lightweight review requires selected risks but retains existing open reviews', () => {
  const s = fixture();
  s.journeys[0].review_scope = {risks:['permissions'],reason:'Synthetic slice isolates access; no external or durable effects'};
  s.journeys[0].review = {permissions:{status:'covered',reason:'Shared access invariant',refs:['I1']}};
  expect(validate(s,decisions,true).errors).toEqual([]);
  expect(render(s)).toContain('Review scope: permissions.');
  delete s.journeys[0].review.permissions;
  expect(validate(s,decisions,true).errors).toContain('J1: missing permissions branch review');
  s.journeys[0].review.permissions = {status:'covered',reason:'Shared access invariant',refs:['I1']};
  s.journeys[0].review.concurrency = {status:'open',reason:'Previously identified race still needs handling'};
  expect(validate(s,decisions,true).errors).toContain('J1/concurrency: review remains open');
  expect(render(s)).toContain('Previously identified race');
});

test.each([
  null, {risks:['permissions']}, {risks:['unknown'],reason:'Typo'},
  {risks:['permissions','permissions'],reason:'Duplicate'}, {risks:'permissions',reason:'Wrong type'},
])('malformed review scope is rejected: %j', scope => {
  const s=fixture(); s.journeys[0].review_scope=scope;
  expect(validate(s,decisions).errors.join()).toContain('review_scope');
});

test('empty explicit risk scope requires a reason and cannot suppress invariant criteria', () => {
  const s=fixture(); s.journeys[0].review_scope={risks:[],reason:'Pure local presentation slice; synthetic declaration'};
  delete s.journeys[0].review;
  expect(validate(s,decisions,true).errors).toEqual([]);
  delete s.journeys[0].steps[0].criteria.c2;
  expect(validate(s,decisions,true).errors.join()).toContain('forbidden-effect');
});

test('unknown review categories and invalid shared references fail instead of being ignored', () => {
  const s=fixture(); s.journeys[0].review.permissions.refs=['I99'];
  expect(validate(s,decisions,true).errors.join()).toContain('unknown review ref I99');
  s.journeys[0].review.typo={status:'open',reason:'Must not disappear'};
  expect(validate(s,decisions).errors).toContain('J1: unknown review category typo');
});

test('CLI and staged hook expose policy-only gate while preserving strict readiness', async () => {
  const dir=await mkdtemp(join(tmpdir(),'journeys-policy-'));
  try {
    const s=fixture(); s.journeys[0].review.dependencies={status:'open',reason:'Persistence design remains'};
    await writeFile(join(dir,'decisions.md'),decisionText);
    await writeFile(join(dir,'feature.yaml'),Bun.YAML.stringify(s));
    expect(run(dir,'bun',cli,'render','feature.yaml').exitCode).toBe(0);
    const result=run(dir,'bun',cli,'check','feature.yaml','--policy-ready');
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain('policy only; engineering reviews may remain');
    expect(run(dir,'bun',cli,'check','feature.yaml','--ready').exitCode).toBe(1);
    expect(run(dir,'bun',cli,'check','feature.yaml','--ready','--policy-ready').exitCode).toBe(1);
    expect(run(dir,'git','init','-q').exitCode).toBe(0);
    expect(run(dir,'git','add','.').exitCode).toBe(0);
    expect(run(dir,'sh',hook,'feature.yaml','--policy-ready').exitCode).toBe(0);
    s.journeys[0].steps[1].decisions=['Q1'];
    await writeFile(join(dir,'feature.yaml'),Bun.YAML.stringify(s));
    expect(run(dir,'git','add','feature.yaml').exitCode).toBe(0);
    const rejected=run(dir,'sh',hook,'feature.yaml','--policy-ready');
    expect(rejected.exitCode).toBe(1);
    expect(rejected.stderr.toString()).toContain('unresolved policy Q1');
  } finally { await rm(dir,{recursive:true,force:true}); }
});
