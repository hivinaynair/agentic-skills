import { mkdtemp, mkdir, cp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

// Optional behavioral evaluation: requires an authenticated Codex CLI and uses model quota.
// It is deliberately not part of bun test. Generated projects and raw logs stay in /tmp.
const startedAt = new Date().toISOString();
const repo = resolve(import.meta.dir, '../..');
const root = await mkdtemp(join(tmpdir(), 'agentic-discovery-'));
const cases = [
  {
    id: 'implicit-decide', expected: ['decide'],
    prompt: 'We need to plan team invitations before implementing anything. Only admins can invite, links expire after 48 hours and admins can revoke them. We want shareable links without email delivery. The role granted to a new member is still unclear. Capture settled requirements, exclusions and blocking product questions in docs/decisions.md, then ask the single most important unanswered question. Do not implement application code.',
  },
  {
    id: 'implicit-journeys', expected: ['journeys'],
    prompt: 'Our task-archiving requirements are agreed in docs/decisions.md. Map the feature into actor goals, steps, failure branches, invariants and testable acceptance criteria. Write the structured specification and readable view under docs/journeys. Include unauthorized access, duplicate requests and interrupted completion. Keep unsupported behavior visible rather than inventing product policy. Do not implement application code.',
  },
  {
    id: 'negative-small-edit', expected: [],
    prompt: 'Change the heading in README.md from Task Board to Taskboard. Make only that wording change.',
  },
  {
    id: 'vague-company-ticket', expected: ['decide'],
    prompt: 'I have been assigned the ticket in docs/ticket.md. Read it and the project context, clarify the requirements before implementation, and leave a useful record for the next builder. I am the implementing engineer. Ask the most useful next question. Do not implement the feature or contact colleagues.',
  },
];
const decisionRecord = `# Decisions\n\n| ID | Status | Decision | Why | Alternatives | Source | Date | Supersedes |\n|---|---|---|---|---|---|---|---|\n| D1 | accepted | Only the signed-in task owner can archive a task | Account isolation | Anyone can archive: rejected | Synthetic fixture owner | 2026-10-16 | |\n| D2 | accepted | Archiving sets the task to archived without deleting its contents | Preserve history | Permanent deletion: rejected | Synthetic fixture owner | 2026-10-16 | |\n| D3 | accepted | Repeating an archive request returns the existing archived result without another effect | Safe repeats | Duplicate effects: rejected | Synthetic fixture owner | 2026-10-16 | |\n| X1 | accepted | Restore and bulk archive are outside this feature | Bound the task | Include both: rejected | Synthetic fixture owner | 2026-10-16 | |\n`;
const version = Bun.spawnSync(['codex', '--version']).stdout.toString().trim();
const selected = process.argv[2] ? cases.filter(test => test.id === process.argv[2]) : cases;
if (!selected.length) throw Error('Unknown discovery case');
const results = await Promise.all(selected.map(async (test) => {
  const project = join(root, test.id);
  await mkdir(join(project, '.agents/skills'), { recursive: true });
  for (const name of ['decide', 'journeys']) await cp(join(repo, 'skills', name), join(project, '.agents/skills', name), { recursive: true });
  await writeFile(join(project, 'README.md'), '# Task Board\n');
  if (test.id === 'implicit-decide') {
    await mkdir(join(project, 'docs'));
    await writeFile(join(project, 'docs/context.md'), '# Project context\n\nA synthetic team workspace with no existing invitation implementation.\n');
  }
  if (test.id === 'implicit-journeys') {
    await mkdir(join(project, 'docs'));
    await writeFile(join(project, 'docs/decisions.md'), decisionRecord);
  }
  if (test.id === 'vague-company-ticket') {
    await mkdir(join(project, 'docs'));
    await writeFile(join(project, 'docs/context.md'), '# Project context\n\nThis is an existing TypeScript application. Reports already have date and status filters. Report access is restricted to authorized members of the current workspace. CSV export does not exist. Mara is the product manager responsible for report behavior. The assigned engineer can choose internal implementation details and propose product behavior; they cannot approve changes to data access or export scope.\n');
    await writeFile(join(project, 'docs/ticket.md'), '# Ticket REP-42: Add CSV export to the reports page\n\nSupport relayed that customers spend time manually copying report data for their monthly review. Add a CSV download. Existing report access restrictions must be preserved. Exporting all rows might be useful, but that suggestion has not been agreed. Which customer role needs this and which records or fields they need has not yet been confirmed.\n');
  }
  const init = Bun.spawnSync(['git', 'init', '-q', project]);
  if (init.exitCode) throw Error('Could not initialize fixture');
  const inputFiles = new Map(await Promise.all(
    (await Array.fromAsync(new Bun.Glob('docs/**/*').scan({ cwd: project, onlyFiles: true })))
      .map(async path => [path, await Bun.file(join(project, path)).text()] as const)
  ));
  const args = ['exec', '--ignore-user-config', '--ephemeral', '--json', '-s', 'workspace-write', '-C', project, test.prompt];
  const proc = Bun.spawn(['codex', ...args], { stdout: 'pipe', stderr: 'pipe' });
  const timeout = setTimeout(() => proc.kill(), 300_000);
  const [stdout, stderr, exitCode] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  clearTimeout(timeout);
  await writeFile(join(root, `${test.id}.jsonl`), stdout);
  await writeFile(join(root, `${test.id}.stderr`), stderr);
  const events = stdout.split('\n').filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return {}; } });
  const commands = events.filter(e => e.type === 'item.completed' && e.item?.type === 'command_execution').map(e => e.item);
  // Require a successful command that names the repo-local entry point and returns
  // its body. A mention in the final response alone is not evidence of invocation.
  const loaded = ['decide', 'journeys'].filter(name => commands.some(item =>
    item.exit_code === 0 && item.command?.includes(`.agents/skills/${name}`) && item.command.includes('SKILL.md') && item.aggregated_output?.includes(name === 'decide' ? '# Decide' : '# Journeys')
  ));
  const final = events.filter(e => e.item?.type === 'agent_message').map(e => e.item.text).join('\n');
  const files = await Array.fromAsync(new Bun.Glob('docs/**/*').scan({ cwd: project, onlyFiles: true }));
  const generatedFiles = files.filter(path => !inputFiles.has(path)).sort();
  const modifiedInputFiles = [];
  for (const path of files) if (inputFiles.has(path) && inputFiles.get(path) !== await Bun.file(join(project, path)).text()) modifiedInputFiles.push(path);
  const removedInputFiles = [...inputFiles.keys()].filter(path => !files.includes(path)).sort();
  const negativeEdit = test.id !== 'negative-small-edit' || await Bun.file(join(project, 'README.md')).text() === '# Taskboard\n';
  const passed = exitCode === 0 && JSON.stringify(loaded) === JSON.stringify(test.expected) && negativeEdit;
  return { id: test.id, prompt: test.prompt, expected: test.expected, loaded, exitCode, passed, inputFiles: [...inputFiles.keys()].sort(), generatedFiles, modifiedInputFiles: modifiedInputFiles.sort(), removedInputFiles, finalResponse: final };
}));
const hashes: Record<string, string> = {};
for (const name of ['decide', 'journeys']) hashes[name] = new Bun.CryptoHasher('sha256').update(await Bun.file(join(repo, 'skills', name, 'SKILL.md')).text()).digest('hex');
const result = { date: startedAt.slice(0, 10), startedAt, version, platform: process.platform, model: 'CLI default; no override', userConfig: 'ignored; machine/user skill discovery was not disabled', skillHashes: hashes, results };
await writeFile(join(root, 'results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ rawArtifacts: root, ...result }, null, 2));
if (results.some(r => !r.passed)) process.exitCode = 1;
