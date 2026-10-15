import {test, expect} from 'bun:test';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {validate, decisionsFrom, render, risks} from '../skills/journeys/scripts/journeys';

function observed(): any {
  return {
    version: 1, feature: 'Recovery observations', retired: [],
    actors: [{id: 'worker', name: 'Worker'}],
    observations: [{id:'O1', statement:'The worker retries once after a timeout', sources:[{ref:'worker.ts',revision:'abc123',locator:'runJob, lines 20-30'}]}],
    invariants: [{id:'I1', rule:'THE SYSTEM SHALL NOT execute a third attempt', observations:['O1']}],
    coverage: [{id:'C1',actor:'worker',goal:'Recover a timed-out attempt',status:'mapped',journeys:['J1']}],
    journeys: [{id:'J1',title:'Retry',actor:'worker',entry:'J1.S1',exits:['done'],
      steps:[{id:'J1.S1',title:'Retry once',kind:'system',observations:['O1'],invariants:['I1'],criteria:{c1:'WHEN a timeout occurs THE SYSTEM SHALL retry once',c2:'IF the second attempt fails THE SYSTEM SHALL NOT start a third attempt'},exit:'done'}],
      review:Object.fromEntries(risks.map(r=>[r,{status:'covered',reason:'Test fixture boundary',refs:['J1.S1']}]))}],
  };
}
const empty = new Map();
const accepted = decisionsFrom('| ID | Status | Decision | Supersedes |\n| D1 | accepted | At most two attempts | |\n| X1 | accepted | No email delivery | |');
const check = (s: any, ready=false, coverage=false) => validate(s,empty,ready,coverage);
function withSecondJourney(s: any) {
  const j = structuredClone(s.journeys[0]); j.id='J2'; j.entry='J2.S1'; j.steps[0].id='J2.S1';
  for(const r of Object.values(j.review) as any[]) r.refs=['J2.S1'];
  s.journeys.push(j);
  s.coverage.push({id:'C2',actor:'worker',goal:'Clean up after a failed attempt',status:'mapped',journeys:['J2']});
  return s;
}

test('source-backed observations validate with coverage but cannot authorize readiness',()=>{
  const s=observed();
  expect(check(s,false,true)).toMatchObject({errors:[],warnings:[]});
  expect([...check(s).rules]).toEqual(['I1','J1.S1.c1','J1.S1.c2']);
  expect(check(s,true).errors.filter(e=>e.includes('not approved policy'))).toHaveLength(2);
  expect(render(s)).toContain('Source: worker.ts; revision: abc123; location: runJob, lines 20-30');
  expect(render(s)).toContain('Observed behavior: descriptive, not approved for implementation.');
});
test('accepted decisions can support policy alongside observations without converting them',()=>{
  const s=observed(); s.decisions='decisions.md';
  s.invariants[0].decisions=['D1']; s.journeys[0].steps[0].decisions=['D1'];
  expect(validate(s,accepted,true).errors).toEqual([]);
  s.journeys[0].steps[0].decisions=['O1'];
  expect(validate(s,accepted,true).errors.join()).toContain('unknown decision O1');
});
test.each([
  ['missing sources',(s:any)=>delete s.observations[0].sources,'require source'],
  ['missing locator',(s:any)=>delete s.observations[0].sources[0].locator,'ref, revision and locator'],
  ['missing revision',(s:any)=>s.observations[0].sources[0].revision='','ref, revision and locator'],
  ['malformed source',(s:any)=>s.observations[0].sources=[null],'ref, revision and locator'],
  ['missing statement',(s:any)=>delete s.observations[0].statement,'missing observation statement'],
  ['unknown observation',(s:any)=>s.journeys[0].steps[0].observations=['O99'],'unknown observation O99'],
  ['duplicate observation',(s:any)=>s.observations.push(structuredClone(s.observations[0])),'Duplicate ID O1'],
  ['retired observation',(s:any)=>s.retired=['O1'],'Retired ID reused'],
  ['no evidence',(s:any)=>delete s.journeys[0].steps[0].observations,'requires decisions or observations'],
  ['null references',(s:any)=>s.journeys[0].steps[0].observations=null,'observations must be an ID list'],
  ['bad inventory',(s:any)=>s.coverage={},'coverage must be a list'],
  ['unknown coverage actor',(s:any)=>s.coverage[0].actor='ghost','unknown coverage actor'],
  ['empty mapping',(s:any)=>s.coverage[0].journeys=[],'mapped coverage needs journeys'],
  ['duplicate coverage ID',(s:any)=>s.coverage.push(structuredClone(s.coverage[0])),'Duplicate ID C1'],
  ['retired coverage',(s:any)=>s.retired=['C1'],'Retired ID reused'],
  ['unknown status',(s:any)=>s.coverage[0].status='complete','invalid coverage status'],
  ['mapped nonexistent journey',(s:any)=>s.coverage[0].journeys=['J99'],'missing mapped journey J99'],
])('%s is rejected',(_,mutate,message)=>{const s=observed();mutate(s);expect(check(s).errors.join()).toContain(message);});
test('removing a whole mapped journey fails even in draft validation',()=>{
  const s=withSecondJourney(observed()); expect(check(s).errors).toEqual([]);
  s.journeys.pop();
  expect(check(s).errors).toContain('C2: missing mapped journey J2');
});
test('missing inventories stay compatible in draft but fail coverage and ready gates',()=>{
  const s=observed();delete s.coverage;
  expect(check(s).errors).toEqual([]);expect(check(s).warnings).toContain('Missing coverage inventory');
  expect(check(s,false,true).errors).toContain('Missing coverage inventory');
  expect(check(s,true).errors).toContain('Missing coverage inventory');
});
test('unresolved goals and journeys omitted from inventory block coverage',()=>{
  const s=withSecondJourney(observed());s.coverage.pop();
  s.coverage.push({id:'C3',actor:'worker',goal:'Recover missed dispatch',status:'unresolved',reason:'No path established'});
  expect(check(s).errors).toEqual([]);
  expect(check(s,false,true).errors).toContain('C3: unresolved coverage');
  expect(check(s,false,true).errors).toContain('J2: journey absent from coverage inventory');
});
test('excluded goals need an accepted exclusion; observations cannot justify exclusion',()=>{
  const s=observed();s.coverage.push({id:'C2',actor:'worker',goal:'Send email',status:'excluded',reason:'Outside slice'});
  expect(check(s).errors).toEqual([]);
  expect(check(s,false,true).errors).toContain('C2: exclusion needs an accepted X decision');
  s.coverage[1].decision='X1';
  expect(validate(s,accepted,false,true).errors).toEqual([]);
  s.coverage[1].decision='O1';expect(check(s).errors.join()).toContain('active X decision');
  s.coverage[1].decision='D1';expect(validate(s,accepted).errors.join()).toContain('active X decision');
});
test('coverage does not silently approve open branch policy',()=>{
  const s=observed();s.journeys[0].review.recovery={status:'open',reason:'Who intervenes is unresolved'};
  expect(check(s,false,true).errors).toEqual([]);
  expect(check(s,false,true).warnings).toContain('J1/recovery: review remains open');
  expect(check(s,true).errors).toContain('J1/recovery: review remains open');
});
test('a goal deleted from both graph and inventory remains a semantic review limitation',()=>{
  const s=withSecondJourney(observed());s.journeys.pop();s.coverage.pop();
  expect(check(s,false,true).errors).toEqual([]);
});

test('CLI and staged hook check observed-only coverage without requiring a decision file',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'observed-hook-'));
  const cli=resolve('skills/journeys/scripts/journeys.ts');
  const hook=resolve('skills/journeys/scripts/pre-commit.sh');
  const run=(...cmd:string[])=>Bun.spawnSync(cmd,{cwd:dir,stdout:'pipe',stderr:'pipe'});
  try {
    const s=withSecondJourney(observed());
    await writeFile(join(dir,'retry.yaml'),Bun.YAML.stringify(s));
    expect(run('bun',cli,'render','retry.yaml').exitCode).toBe(0);
    expect(run('bun',cli,'check','retry.yaml','--coverage').exitCode).toBe(0);
    expect(run('bun',cli,'check','retry.yaml','--ready').exitCode).toBe(1);
    expect(run('git','init','-q').exitCode).toBe(0);expect(run('git','add','.').exitCode).toBe(0);
    expect(run('sh',hook,'retry.yaml','--coverage').exitCode).toBe(0);
    s.journeys.pop();await writeFile(join(dir,'retry.yaml'),Bun.YAML.stringify(s));
    expect(run('sh',hook,'retry.yaml','--coverage').exitCode).toBe(0);
    expect(run('git','add','retry.yaml').exitCode).toBe(0);
    const result=run('sh',hook,'retry.yaml','--coverage');
    expect(result.exitCode).toBe(1);expect(result.stderr.toString()).toContain('C2: missing mapped journey J2');
  } finally {await rm(dir,{recursive:true,force:true});}
});
