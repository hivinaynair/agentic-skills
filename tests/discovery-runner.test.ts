import {test, expect} from 'bun:test';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

test('discovery runner separates seeded and generated files and dates each run at execution', async () => {
  const root = await mkdtemp(join(tmpdir(), 'discovery-runner-test-'));
  let artifacts: string | undefined;
  try {
    const bin = join(root, 'bin');
    await mkdir(bin);
    // Stub the executable boundary: no model, credentials or network is used.
    await writeFile(join(bin, 'codex'), `#!/usr/bin/env bun
import {join} from 'node:path';
if (process.argv.includes('--version')) { console.log('codex-cli test-stub'); process.exit(0); }
const project = process.argv[process.argv.indexOf('-C') + 1];
let skill;
if (project.endsWith('implicit-decide')) {
  skill = 'decide';
  await Bun.write(join(project, 'docs/decisions.md'), '# Model output\\n');
} else if (project.endsWith('implicit-journeys')) {
  skill = 'journeys';
  const input = join(project, 'docs/decisions.md');
  await Bun.write(input, await Bun.file(input).text() + '\\nReviewed by stub\\n');
  await Bun.write(join(project, 'docs/journeys/task-archiving.yaml'), 'version: 1\\n');
  await Bun.write(join(project, 'docs/journeys/task-archiving.md'), '# Model output\\n');
} else {
  await Bun.write(join(project, 'README.md'), '# Taskboard\\n');
}
if (skill) console.log(JSON.stringify({type:'item.completed', item:{type:'command_execution',exit_code:0,command:'cat .agents/skills/' + skill + '/SKILL.md',aggregated_output:await Bun.file(join(project,'.agents/skills',skill,'SKILL.md')).text()}}));
`, {mode:0o755});
    const clock = join(root, 'clock.js');
    await writeFile(clock, `const NativeDate = Date;
globalThis.Date = class extends NativeDate {
  constructor(value = '2031-03-04T23:59:58.000Z') { super(value); }
  static now() { return NativeDate.parse('2031-03-04T23:59:58.000Z'); }
};
`);
    const proc = Bun.spawn([process.execPath, '--preload', clock, resolve(import.meta.dir, '../evaluation/discovery/run.ts')], {
      env:{...process.env, PATH:`${bin}:${process.env.PATH}`}, stdout:'pipe', stderr:'pipe',
    });
    const [stdout, stderr, exitCode] = await Promise.all([new Response(proc.stdout).text(),new Response(proc.stderr).text(),proc.exited]);
    expect(stderr).toBe('');
    const result = JSON.parse(stdout);
    artifacts = result.rawArtifacts;
    expect(exitCode).toBe(0);
    expect(result.version).toBe('codex-cli test-stub');
    expect(result.date).toBe('2031-03-04');
    expect(result.startedAt).toBe('2031-03-04T23:59:58.000Z');
    const decide = result.results.find((r: any) => r.id === 'implicit-decide');
    expect(decide.inputFiles).toEqual(['docs/context.md']);
    expect(decide.generatedFiles).toEqual(['docs/decisions.md']);
    expect(decide.modifiedInputFiles).toEqual([]);
    const journeys = result.results.find((r: any) => r.id === 'implicit-journeys');
    expect(journeys.inputFiles).toEqual(['docs/decisions.md']);
    expect(journeys.generatedFiles).toEqual(['docs/journeys/task-archiving.md','docs/journeys/task-archiving.yaml']);
    expect(journeys.modifiedInputFiles).toEqual(['docs/decisions.md']);
    expect(journeys.removedInputFiles).toEqual([]);
    const negative = result.results.find((r: any) => r.id === 'negative-small-edit');
    expect(negative.generatedFiles).toEqual([]);
    expect(negative.passed).toBe(true);
  } finally {
    if (artifacts) await rm(artifacts, {recursive:true, force:true});
    await rm(root, {recursive:true, force:true});
  }
});
