import {test, expect} from 'bun:test';
import {mkdtemp, rm, mkdir, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
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
