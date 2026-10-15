#!/usr/bin/env bun
import { resolve, dirname, extname } from 'node:path';

// Deliberately dependency-free. Parsing uses Bun; pure validation is exported for tests.
type Obj = Record<string, any>;
const object = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string' && x.length > 0);
const nonempty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const ears = /^(?:(?:WHEN|IF|WHILE) .+ )?THE SYSTEM SHALL(?: NOT)? .+/;
export const risks = ['input', 'permissions', 'interruption', 'dependencies', 'duplicates', 'concurrency', 'recovery'];
export type Decision = { id: string; status: string; text: string; supersedes: string[] };
export function decisionsFrom(markdown: string): Map<string, Decision> {
  const result = new Map<string, Decision>();
  let headers: string[] = [];
  for (const line of markdown.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.trim().split('|').slice(1, -1).map(x => x.trim());
    if (cells[0] === 'ID') { headers = cells; continue; }
    if (!/^[DXQ]\d+$/.test(cells[0] ?? '')) continue;
    if (!['ID', 'Status', 'Decision', 'Supersedes'].every(h => headers.includes(h))) throw Error('Decision table requires ID, Status, Decision and Supersedes columns');
    const id = cells[0];
    if (result.has(id)) throw Error(`Duplicate decision ${id}`);
    const status = cells[headers.indexOf('Status')];
    if (!['draft', 'accepted', 'superseded', 'retired', 'open', 'resolved'].includes(status)) throw Error(`${id}: invalid status`);
    if (id.startsWith('Q') && !['open', 'resolved', 'retired'].includes(status)) throw Error(`${id}: question has invalid status`);
    if (!id.startsWith('Q') && ['open', 'resolved'].includes(status)) throw Error(`${id}: decision has question status`);
    const text = cells[headers.indexOf('Decision')];
    if (!nonempty(text)) throw Error(`${id}: empty decision`);
    const raw = cells[headers.indexOf('Supersedes')] ?? '';
    const supersedes = raw ? raw.split(/,\s*/) : [];
    if (supersedes.some(x => !/^[DX]\d+$/.test(x))) throw Error(`${id}: invalid Supersedes IDs`);
    result.set(id, {id, status, text, supersedes});
  }
  if (!result.size) throw Error('No supported decision rows found');
  for (const d of result.values()) for (const old of d.supersedes) {
    if (old === d.id || !result.has(old)) throw Error(`${d.id}: invalid superseded decision ${old}`);
    if (result.get(old)!.status !== 'superseded') throw Error(`${old}: mark replaced decision superseded`);
  }
  return result;
}

export function validate(s: unknown, decisions: Map<string, Decision>, ready = false, requireCoverage = false) {
  const errors: string[] = [], warnings: string[] = [];
  const active = new Set<string>(), rules = new Set<string>();
  const err = (m: string) => errors.push(m);
  const add = (id: unknown, pattern: RegExp, owner: string) => {
    if (typeof id !== 'string' || !pattern.test(id)) { err(`${owner}: invalid ID`); return; }
    if (active.has(id)) err(`Duplicate ID ${id}`);
    active.add(id);
  };
  const refs = (refs: unknown, owner: string) => {
    if (!strings(refs)) { err(`${owner}: decisions must be a list`); return; }
    for (const id of refs) {
      const d = decisions.get(id);
      if (!d) err(`${owner}: unknown decision ${id}`);
      else if (['superseded', 'retired', 'resolved'].includes(d.status)) err(`${owner}: inactive decision ${id}`);
      else if (d.status !== 'accepted') (ready ? errors : warnings).push(`${owner}: unresolved policy ${id}`);
    }
  };
  const rule = (v: unknown, id: string) => {
    if (typeof v !== 'string' || !ears.test(v)) err(`${id}: expected EARS behavior`);
    else if (/\b(promptly|as needed|quickly|appropriately)\b/i.test(v.replace(/"[^"]*"|`[^`]*`/g, ''))) warnings.push(`${id}: vague requirement; use an observable outcome`);
  };
  if (!object(s)) return {errors: ['Spine must be an object'], warnings, rules};
  if (s.version !== 1) err('Expected version: 1');
  if (!nonempty(s.feature)) err('Missing feature');
  if (s.decisions !== undefined && !nonempty(s.decisions)) err('Invalid decisions path');
  if (!strings(s.retired)) err('retired must be a list of IDs');
  const actorIds = new Set<string>();
  if (!Array.isArray(s.actors) || !s.actors.length) err('actors must be a nonempty list');
  for (const a of Array.isArray(s.actors) ? s.actors : []) {
    if (!object(a) || !nonempty(a.id) || !nonempty(a.name)) { err('Invalid actor'); continue; }
    if (actorIds.has(a.id)) err(`Duplicate actor ${a.id}`);
    actorIds.add(a.id);
  }
  const observationIds = new Set<string>();
  if (s.observations !== undefined && !Array.isArray(s.observations)) err('observations must be a list');
  for (const o of Array.isArray(s.observations) ? s.observations : []) {
    if (!object(o)) { err('Invalid observation'); continue; }
    add(o.id, /^O\d+$/, 'observation'); observationIds.add(o.id);
    if (!nonempty(o.statement)) err(`${o.id}: missing observation statement`);
    if (!Array.isArray(o.sources) || !o.sources.length) err(`${o.id}: observations require source references`);
    for (const source of Array.isArray(o.sources) ? o.sources : []) {
      if (!object(source) || !nonempty(source.ref) || !nonempty(source.revision) || !nonempty(source.locator)) err(`${o.id}: each source needs ref, revision and locator`);
    }
  }
  const basis = (owner: Obj, id: string) => {
    const policy = owner.decisions === undefined ? [] : owner.decisions;
    const observed = owner.observations === undefined ? [] : owner.observations;
    refs(policy, id);
    if (!strings(observed)) err(`${id}: observations must be an ID list`);
    else for (const ref of observed) if (!observationIds.has(ref)) err(`${id}: unknown observation ${ref}`);
    if ((!strings(policy) || !policy.length) && (!strings(observed) || !observed.length)) err(`${id}: requires decisions or observations`);
    if (ready && strings(policy) && !policy.length) err(`${id}: observed behavior is not approved policy; accepted decisions required for readiness`);
  };
  const invariantIds = new Set<string>();
  if (!Array.isArray(s.invariants)) err('invariants must be a list (empty is allowed)');
  for (const inv of Array.isArray(s.invariants) ? s.invariants : []) {
    if (!object(inv)) { err('Invalid invariant'); continue; }
    add(inv.id, /^I\d+$/, 'invariant'); invariantIds.add(inv.id); rules.add(inv.id);
    rule(inv.rule, inv.id); basis(inv, inv.id);
  }
  if (!Array.isArray(s.journeys) || !s.journeys.length) err('journeys must be a nonempty list');
  for (const j of Array.isArray(s.journeys) ? s.journeys : []) {
    if (!object(j)) { err('Invalid journey'); continue; }
    add(j.id, /^J\d+$/, 'journey');
    if (!nonempty(j.title)) err(`${j.id}: missing title`);
    if (!actorIds.has(j.actor)) err(`${j.id}: unknown actor`);
    if (!strings(j.exits) || !j.exits.length) err(`${j.id}: exits must be a nonempty list`);
    const exits = new Set<string>(strings(j.exits) ? j.exits : []);
    if (strings(j.exits) && exits.size !== j.exits.length) err(`${j.id}: duplicate exits`);
    if (!Array.isArray(j.steps) || !j.steps.length) { err(`${j.id}: steps must be nonempty`); continue; }
    const steps = new Map<string, Obj>();
    for (const st of j.steps) {
      if (!object(st)) { err(`${j.id}: invalid step`); continue; }
      add(st.id, /^J\d+\.S\d+[a-z]?$/, 'step');
      if (typeof st.id !== 'string' || !st.id.startsWith(`${j.id}.`)) err(`${st.id}: wrong journey prefix`);
      steps.set(st.id, st);
    }
    if (!steps.has(j.entry)) err(`${j.id}: entry must name a step`);
    const graph = new Map<string, string[]>(), terminals = new Set<string>();
    for (const [id, st] of steps) {
      graph.set(id, []);
      if (!nonempty(st.title)) err(`${id}: missing title`);
      if (!['human', 'system', 'external'].includes(st.kind)) err(`${id}: invalid kind`);
      if (st.state !== undefined && !nonempty(st.surface)) err(`${id}: state requires a surface`);
      basis(st, id);
      if (!strings(st.invariants)) err(`${id}: invariants must be a list`);
      for (const inv of strings(st.invariants) ? st.invariants : []) if (!invariantIds.has(inv)) err(`${id}: unknown invariant ${inv}`);
      if (!object(st.criteria) || !Object.keys(st.criteria).length) err(`${id}: criteria must be a nonempty map`);
      for (const [key, value] of object(st.criteria) ? Object.entries(st.criteria) : []) {
        add(`${id}.${key}`, /^J\d+\.S\d+[a-z]?\.c\d+$/, 'criterion');
        rules.add(`${id}.${key}`); rule(value, `${id}.${key}`);
      }
      if (strings(st.invariants) && st.invariants.length && !Object.values(object(st.criteria) ? st.criteria : {}).some(v => typeof v === 'string' && /^IF .+ THE SYSTEM SHALL NOT .+/.test(v))) err(`${id}: invariant-sensitive step needs a forbidden-effect criterion`);
      if ((st.next !== undefined) === (st.exit !== undefined)) err(`${id}: choose exactly one of next or exit`);
      if (st.exit !== undefined) {
        if (!exits.has(st.exit)) err(`${id}: unknown exit ${st.exit}`);
        else terminals.add(id);
      }
      if (st.next !== undefined) {
        if (!Array.isArray(st.next) || !st.next.length) { err(`${id}: next must be nonempty edges`); continue; }
        for (const edge of st.next) {
          if (!object(edge) || !nonempty(edge.when) || ((edge.to !== undefined) === (edge.exit !== undefined))) { err(`${id}: each edge needs when and exactly one of to or exit`); continue; }
          if (edge.to !== undefined) {
            if (!steps.has(edge.to)) err(`${id}: missing target ${edge.to}`);
            else graph.get(id)!.push(edge.to);
          } else if (!exits.has(edge.exit)) err(`${id}: unknown exit ${edge.exit}`);
          else terminals.add(id);
        }
      }
    }
    const reached = new Set<string>(), pending = [j.entry];
    while (pending.length) { const id = pending.pop()!; if (reached.has(id)) continue; reached.add(id); pending.push(...(graph.get(id) ?? [])); }
    for (const id of steps.keys()) if (!reached.has(id)) err(`${id}: unreachable from entry`);
    const canExit = new Set(terminals);
    let changed = true;
    while (changed) { changed = false; for (const [id, edges] of graph) if (!canExit.has(id) && edges.some(e => canExit.has(e))) { canExit.add(id); changed = true; } }
    for (const id of steps.keys()) if (!canExit.has(id)) err(`${id}: no path to an exit`);
    // A review records human/agent reasoning. It cannot establish semantic completeness.
    for (const risk of risks) {
      const r = object(j.review) ? j.review[risk] : undefined;
      if (!object(r)) { (ready ? errors : warnings).push(`${j.id}: missing ${risk} branch review`); continue; }
      if (!['covered', 'not-applicable', 'open'].includes(r.status) || !nonempty(r.reason)) err(`${j.id}/${risk}: needs status and reason`);
      if (r.status === 'open') (ready ? errors : warnings).push(`${j.id}/${risk}: review remains open`);
      if (r.status === 'covered') {
        if (!strings(r.refs) || !r.refs.length) err(`${j.id}/${risk}: covered review needs refs`);
        else for (const ref of r.refs) if (!steps.has(ref) && ![...steps.keys()].some(id => object(steps.get(id)!.criteria) && Object.keys(steps.get(id)!.criteria).some(k => `${id}.${k}` === ref))) err(`${j.id}/${risk}: unknown review ref ${ref}`);
      }
    }
  }
  const coverageGate = ready || requireCoverage;
  const journeyIds = new Set((Array.isArray(s.journeys) ? s.journeys : []).filter(object).map(j => j.id));
  const mapped = new Set<string>();
  if (s.coverage === undefined || (Array.isArray(s.coverage) && !s.coverage.length)) (coverageGate ? errors : warnings).push('Missing coverage inventory');
  else if (!Array.isArray(s.coverage)) err('coverage must be a list');
  for (const c of Array.isArray(s.coverage) ? s.coverage : []) {
    if (!object(c)) { err('Invalid coverage entry'); continue; }
    add(c.id, /^C\d+$/, 'coverage');
    if (!nonempty(c.goal)) err(`${c.id}: missing coverage goal`);
    if (!actorIds.has(c.actor)) err(`${c.id}: unknown coverage actor`);
    if (!['mapped', 'excluded', 'unresolved'].includes(c.status)) { err(`${c.id}: invalid coverage status`); continue; }
    if (c.status === 'mapped') {
      if (!strings(c.journeys) || !c.journeys.length) err(`${c.id}: mapped coverage needs journeys`);
      else for (const id of c.journeys) {
        if (!journeyIds.has(id)) err(`${c.id}: missing mapped journey ${id}`);
        else mapped.add(id);
      }
      if (c.decision !== undefined) err(`${c.id}: exclusion decision is only valid for excluded coverage`);
    } else {
      if (!nonempty(c.reason)) err(`${c.id}: ${c.status} coverage needs a reason`);
      if (c.journeys !== undefined) err(`${c.id}: only mapped coverage may name journeys`);
      if (c.status === 'unresolved') {
        (coverageGate ? errors : warnings).push(`${c.id}: unresolved coverage`);
        if (c.decision !== undefined) err(`${c.id}: exclusion decision is only valid for excluded coverage`);
      } else {
        const d = decisions.get(c.decision);
        if (c.decision !== undefined && (typeof c.decision !== 'string' || !/^X\d+$/.test(c.decision) || !d || ['superseded', 'retired'].includes(d.status))) err(`${c.id}: exclusion must cite an active X decision`);
        if (!d || d.status !== 'accepted') (coverageGate ? errors : warnings).push(`${c.id}: exclusion needs an accepted X decision`);
      }
    }
  }
  if (Array.isArray(s.coverage) && s.coverage.length) for (const id of journeyIds) if (!mapped.has(id)) (coverageGate ? errors : warnings).push(`${id}: journey absent from coverage inventory`);
  if (strings(s.retired)) {
    if (new Set(s.retired).size !== s.retired.length) err('Duplicate retired IDs');
    for (const id of s.retired) {
      if (!/^([IOC]\d+|J\d+(\.S\d+[a-z]?(\.c\d+)?)?)$/.test(id)) err(`Invalid retired ID ${id}`);
      if (active.has(id)) err(`Retired ID reused: ${id}`);
    }
  }
  if (s.tasks !== undefined && !Array.isArray(s.tasks)) err('tasks must be a list');
  const taskIds = new Set<string>();
  for (const task of Array.isArray(s.tasks) ? s.tasks : []) {
    if (!object(task) || !nonempty(task.id) || !strings(task.serves) || !task.serves.length) { err('Invalid task'); continue; }
    if (taskIds.has(task.id)) err(`Duplicate task ${task.id}`); taskIds.add(task.id);
    for (const id of task.serves) if (!/^J\d+\.S\d+[a-z]?$/.test(id) || !active.has(id)) err(`${task.id}: unknown served step ${id}`);
  }
  return {errors, warnings, rules};
}

const escape = (v: unknown) => String(v).replaceAll('|', '\\|').replaceAll('\n', ' ');
export function render(s: Obj): string {
  const out = [`# ${s.feature}`, '', '<!-- Generated by journeys.ts; edit the YAML source. -->', ''];
  if (s.decisions) out.push(`Decisions: [source](${s.decisions})`, '');
  if (s.observations?.length) {
    out.push('## Observations', '', 'Descriptive evidence only. Observations are not approved decisions.', '');
    for (const o of s.observations) {
      out.push(`- **${o.id}**: ${o.statement}`);
      for (const source of o.sources) out.push(`  - Source: ${source.ref}; revision: ${source.revision}; location: ${source.locator}`);
    }
    out.push('');
  }
  if (s.coverage) {
    out.push('## Coverage inventory', '', '| ID | Actor goal | Status | Journeys / reason |', '|---|---|---|---|');
    for (const c of s.coverage) out.push(`| ${c.id} | ${escape(c.actor)}: ${escape(c.goal)} | ${c.status} | ${c.status === 'mapped' ? c.journeys.join(', ') : escape(c.reason) + (c.decision ? ` (${c.decision})` : '')} |`);
    out.push('', 'Inventory completeness and the meaning of each mapping require review.', '');
  }
  const basisText = (item: Obj) => [item.decisions?.join(', '), item.observations?.length ? `observed: ${item.observations.join(', ')}` : ''].filter(Boolean).join('; ');
  out.push('## Invariants', '');
  for (const inv of s.invariants) out.push(`- **${inv.id}**: ${inv.rule} (${basisText(inv)})`);
  for (const j of s.journeys) {
    out.push('', `## ${j.id}: ${j.title}`, '', `Actor: ${j.actor}. Entry: ${j.entry}. Exits: ${j.exits.join(', ')}.`, '', '```mermaid', 'flowchart TD');
    const node = (id: string) => id.replaceAll('.', '_');
    const label = (v: string) => v.replace(/["<>\[\]{}|`\\]/g, '').replaceAll('\n', ' ');
    for (const st of j.steps) {
      out.push(`  ${node(st.id)}["${st.id}: ${label(st.title)}"]`);
      if (st.exit) out.push(`  ${node(st.id)} --> ${node(j.id)}_exit_${j.exits.indexOf(st.exit)}["${label(st.exit)}"]`);
      for (const e of st.next ?? []) out.push(`  ${node(st.id)} -->|"${label(e.when)}"| ${e.to ? node(e.to) : `${node(j.id)}_exit_${j.exits.indexOf(e.exit)}["${label(e.exit)}"]`}`);
    }
    out.push('```', '', s.observations?.length ? '| Step | Kind | Policy / observations | Invariants |' : '| Step | Kind | Decisions | Invariants |', '|---|---|---|---|');
    for (const st of j.steps) out.push(`| ${st.id}: ${escape(st.title)} | ${st.kind} | ${basisText(st)} | ${st.invariants.join(', ')} |`);
    for (const st of j.steps) {
      out.push('', `### ${st.id}`, '');
      if (!st.decisions?.length && st.observations?.length) out.push('Observed behavior: descriptive, not approved for implementation.', '');
      if (st.surface) out.push(`Surface: ${st.surface}${st.state ? `; state: ${st.state}` : ''}.`, '');
      for (const [k, v] of Object.entries(st.criteria)) out.push(`- **${st.id}.${k}**: ${v}`);
    }
    out.push('', '### Branch review', '');
    for (const risk of risks) { const r = j.review?.[risk]; out.push(`- **${risk}**: ${r ? `${r.status}; ${r.reason}${r.refs ? ` (${r.refs.join(', ')})` : ''}` : 'not reviewed'}`); }
  }
  if (s.tasks?.length) { out.push('', '## Tasks', ''); for (const t of s.tasks) out.push(`- **${t.id}**: ${t.serves.join(', ')}`); }
  out.push('', `Retired IDs: ${s.retired.join(', ') || 'none'}.`, '');
  return out.join('\n');
}

export async function verificationProblems(map: unknown, base: string, rules: Set<string>, requireLinks: boolean) {
  const errors: string[] = [];
  if (!object(map)) return ['Verification map must be an object'];
  for (const [id, links] of Object.entries(map)) {
    if (!rules.has(id)) errors.push(`Unknown verification ID ${id}`);
    if (!Array.isArray(links) || !links.length) { errors.push(`${id}: empty verification links`); continue; }
    for (const link of links) {
      if (!object(link) || !nonempty(link.path) || !nonempty(link.locator)) { errors.push(`${id}: link requires path and locator`); continue; }
      const file = Bun.file(resolve(base, link.path));
      if (!await file.exists()) errors.push(`${id}: missing verification file ${link.path}`);
      else if (!(await file.text()).includes(link.locator)) errors.push(`${id}: missing locator in ${link.path}`);
    }
  }
  if (requireLinks) for (const id of rules) if (!Array.isArray(map[id]) || !map[id].length) errors.push(`Missing verification link ${id}`);
  return errors;
}

if (import.meta.main) {
  try {
    const [cmd, input, ...flags] = process.argv.slice(2);
    if (!['validate', 'render', 'check'].includes(cmd) || !input || !['.yaml', '.yml'].includes(extname(input))) throw Error('Usage: bun journeys.ts validate|render|check feature.yaml [--ready] [--coverage] [--verification map.json] [--require-links]');
    let verification: string | undefined;
    for (let i = 0; i < flags.length; i++) {
      if (flags[i] === '--verification') { verification = flags[++i]; if (!verification || verification.startsWith('--')) throw Error('--verification needs a path'); }
      else if (!['--ready', '--coverage', '--require-links'].includes(flags[i])) throw Error(`Unknown option ${flags[i]}`);
    }
    if (flags.includes('--require-links') && !verification) throw Error('--require-links requires --verification');
    const s = Bun.YAML.parse(await Bun.file(input).text());
    if (!object(s)) throw Error('Spine must be an object');
    if (s.decisions !== undefined && !nonempty(s.decisions)) throw Error('Invalid decisions path');
    const decisions = s.decisions ? decisionsFrom(await Bun.file(resolve(dirname(input), s.decisions)).text()) : new Map<string, Decision>();
    const result = validate(s, decisions, flags.includes('--ready'), flags.includes('--coverage'));
    for (const w of result.warnings) console.error(`warn: ${w}`);
    if (result.errors.length) throw Error(result.errors.join('\n'));
    if (verification) {
      const errors = await verificationProblems(await Bun.file(verification).json(), dirname(resolve(verification)), result.rules, flags.includes('--require-links'));
      if (errors.length) throw Error(errors.join('\n'));
    }
    const output = input.replace(/\.ya?ml$/, '.md');
    const expected = render(s);
    if (cmd === 'render') await Bun.write(output, expected);
    if (cmd === 'check' && (!await Bun.file(output).exists() || await Bun.file(output).text() !== expected)) throw Error(`${output}: generated document is missing or stale; run render`);
    console.log(`ok: ${cmd} ${input}; ${result.rules.size} rules; ${result.warnings.length} warnings. Tests were not executed.`);
  } catch (e) { console.error(`ERROR: ${e instanceof Error ? e.message : e}`); process.exit(1); }
}
