#!/usr/bin/env bun
import { resolve, dirname, extname, relative, isAbsolute, sep } from 'node:path';
import { realpath } from 'node:fs/promises';

// Deliberately dependency-free. Parsing and validation are exported for tests.
export const checkNames = ['denied', 'invalid', 'failed', 'repeated'];
const ears = /^(?:(?:WHEN|IF|WHILE) .+ )?THE SYSTEM SHALL(?: NOT)? .+/;
const forbidden = /^IF .+ THE SYSTEM SHALL NOT .+/;
const separator = /\s+(?:—|–|--?)\s+/;
const keys = ['Decisions', 'Approved', 'Retired', 'Scope', 'Actor', 'Exits', 'Checks', 'Screen', 'Sees', 'Basis', 'Guards'];
const list = (v: string) => v.split(',').map(x => x.trim()).filter(x => x && !/^(—|-|none)$/i.test(x));

export type Decision = { id: string; status: string; text: string; supersedes: string[]; answer?: string };
export type Edge = { to?: string; exit?: string; when?: string };
export type Step = { id: string; title: string; kind: string; screen?: string; sees?: string; basis: string[]; guards: string[]; criteria: [string, string][]; edges: Edge[] };
export type Check = { status: 'covered' | 'n/a' | 'open'; refs: string[]; reason: string };
export type Journey = { id: string; title: string; actor?: string; exits: string[]; checks: Record<string, Check>; steps: Step[] };
export type Goal = { id: string; actor: string; goal: string; status: 'mapped' | 'excluded' | 'unresolved' | 'elsewhere'; journeys: string[]; decision?: string; reason?: string };
export type Source = { ref?: string; revision?: string; locator?: string };
export type Spec = {
  feature: string; decisions?: string; approval?: { id: string; hash: string }; retired: string[]; scope: string[];
  actors: { id: string; name: string }[]; goals: Goal[];
  invariants: { id: string; rule: string; basis: string[] }[];
  observations: { id: string; statement: string; sources: Source[] }[];
  journeys: Journey[];
};

// The hook supplies its exported index root. Resolve symlinks before any content
// read so a staged file cannot pull in content from outside the snapshot.
async function snapshotRead(path: string, root?: string): Promise<string> {
  if (!root) return path;
  const [base, target] = await Promise.all([realpath(root), realpath(path)]);
  const fromRoot = relative(base, target);
  if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) throw Error(`Path escapes staged snapshot: ${path}`);
  return target;
}

// Reads "- D1 accepted — Text" lines and table rows with ID, Status and Decision
// columns, so existing table records work unchanged. Everything else is prose.
export function parseDecisions(markdown: string) {
  const decisions = new Map<string, Decision>(), errors: string[] = [];
  const add = (id: string, status: string, text: string, supersedes: string, where: string) => {
    if (decisions.has(id)) errors.push(`${where}: duplicate decision ${id}`);
    const valid = id.startsWith('Q') ? ['open', 'deferred', 'resolved', 'retired'] : ['draft', 'accepted', 'superseded', 'retired'];
    if (!valid.includes(status)) errors.push(`${where}: ${id} has invalid status ${status}`);
    if (!text) errors.push(`${where}: ${id} has no text`);
    const answer = id.startsWith('Q') ? text.match(/\b(?:answered|resolved) by\s+(D\d+)|^(D\d+):/i)?.slice(1).find(Boolean) : undefined;
    decisions.set(id, { id, status, text, supersedes: list(supersedes), answer });
  };
  let headers: string[] = [];
  markdown.split('\n').forEach((raw, i) => {
    const line = raw.trim(), where = `decisions line ${i + 1}`;
    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells[0] === 'ID') { headers = cells; return; }
      if (!/^[DXQ]\d+$/.test(cells[0] ?? '')) return;
      // Tables without a Status column (indexes, crosswalks) are prose.
      const textColumn = ['Decision', 'Answer', 'Question'].find(h => headers.includes(h));
      if (headers.includes('Status') && textColumn) {
        const cell = (h: string) => cells[headers.indexOf(h)] ?? '';
        add(cells[0], cell('Status'), cell(textColumn), headers.includes('Supersedes') ? cell('Supersedes') : '', where);
      }
      return;
    }
    // "- D1 accepted — Text": an ID, a status word, then a dash. Bullets that merely start with an ID are prose.
    const m = line.match(/^[-*]\s+([DXQ]\d+)\s+([a-z]+)\s+(?:—|–|-)\s+(.*)$/);
    if (m) add(m[1], m[2], m[3].trim(), m[3].match(/\bSupersedes:\s*([DX]\d+(?:\s*,\s*[DX]\d+)*)/)?.[1] ?? '', where);
  });
  if (!decisions.size) errors.push('No decisions found: use "- D1 accepted — ..." lines or a table with ID, Status and Decision columns');
  for (const d of decisions.values()) {
    for (const old of d.supersedes) {
      if (old === d.id || !decisions.has(old)) errors.push(`${d.id}: supersedes unknown decision ${old}`);
      // A draft replacement leaves the old decision in force until the owner accepts it.
      else if (d.status === 'accepted' && decisions.get(old)?.status !== 'superseded') errors.push(`${old}: mark replaced decision superseded`);
    }
    if (d.answer && !decisions.has(d.answer)) errors.push(`${d.id}: answered by unknown decision ${d.answer}`);
  }
  return { decisions, errors };
}

function parseCheck(value: string): Check {
  const m = value.match(/^(n\/a|open)\b\s*(?:(?:—|–|--?|:)\s*(.*))?$/i);
  if (m) return { status: m[1].toLowerCase() as Check['status'], refs: [], reason: (m[2] ?? '').trim() };
  const [refs, ...note] = value.split(separator);
  return { status: 'covered', refs: list(refs), reason: note.join(' ') };
}

// "D117–D125, X6–X8, D130" lists the decisions this spec must cover.
function expandScope(value: string) {
  return list(value).flatMap(part => {
    const m = part.match(/^([DX])(\d+)\s*(?:–|-)\s*\1?(\d+)$/);
    if (!m) return [part];
    return Array.from({ length: Math.max(0, Number(m[3]) - Number(m[2]) + 1) }, (_, i) => `${m[1]}${Number(m[2]) + i}`);
  });
}

export function parseJourneys(markdown: string) {
  const spec: Spec = { feature: '', retired: [], scope: [], actors: [], goals: [], invariants: [], observations: [], journeys: [] };
  const errors: string[] = [];
  let section = 'header', inChecks = false;
  let journey: Journey | undefined, step: Step | undefined;
  const setKey = (key: string, value: string): boolean => {
    if (section === 'header') {
      if (key === 'Decisions') spec.decisions = value;
      else if (key === 'Retired') spec.retired = list(value);
      else if (key === 'Scope') spec.scope = expandScope(value);
      else if (key === 'Approved') {
        const m = value.match(/^(D\d+)\s+([0-9a-f]{8})$/);
        if (!m) return false;
        spec.approval = { id: m[1], hash: m[2] };
      } else return false;
    } else if (journey && !step) {
      if (key === 'Actor') journey.actor = value;
      else if (key === 'Exits') journey.exits = list(value);
      else if (key === 'Checks' && !value) inChecks = true;
      else return false;
    } else if (step) {
      if (key === 'Screen') step.screen = value;
      else if (key === 'Sees') step.sees = value;
      else if (key === 'Basis') step.basis = list(value);
      else if (key === 'Guards') step.guards = list(value);
      else return false;
    } else return false;
    return true;
  };
  for (const [index, raw] of markdown.split('\n').entries()) {
    const line = raw.trim(), at = `line ${index + 1}`;
    const bad = () => errors.push(`${at}: cannot parse "${line}"`);
    if (!line || line.startsWith('<!--')) continue;
    const title = line.match(/^# (.+)$/);
    if (title) { if (!spec.feature) spec.feature = title[1].trim(); continue; }
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      journey = step = undefined; inChecks = false;
      const name = heading[1].trim(), j = name.match(/^(J\d+):\s*(.+)$/);
      if (j) { journey = { id: j[1], title: j[2], exits: [], checks: {}, steps: [] }; spec.journeys.push(journey); section = 'journey'; }
      else section = ['Actors', 'Goals', 'Invariants', 'Observations'].includes(name) ? name.toLowerCase() : 'prose';
      continue;
    }
    if (section === 'prose') continue;
    const stepHeading = line.match(/^### (.+)$/);
    if (stepHeading) {
      inChecks = false;
      const s = stepHeading[1].match(/^(J\d+\.S\d+[a-z]?)\s+(.+?)\s+\((person|system|external)\)$/);
      if (!journey || !s) { bad(); continue; }
      step = { id: s[1], title: s[2], kind: s[3], basis: [], guards: [], criteria: [], edges: [] };
      journey.steps.push(step);
      continue;
    }
    // "Key: value · Key: value" with a known key is structure; any other text is prose.
    const first = line.match(/^([A-Z][a-z]+):/);
    if (first && keys.includes(first[1])) {
      for (const part of line.split(/\s+·\s+/)) {
        const kv = part.match(/^([A-Z][a-z]+):\s*(.*)$/);
        if (!kv || !keys.includes(kv[1])) { bad(); break; }
        if (!setKey(kv[1], kv[2].trim())) { errors.push(`${at}: ${kv[1]} is not valid here`); break; }
      }
      continue;
    }
    if (/^(→|->)/.test(line)) {
      const e = line.match(/^(?:→|->)\s*(?:exit\s+([\w-]+)|(J\d+\.S\d+[a-z]?))(?:\s+when\s+(.+))?$/);
      if (step && e) step.edges.push({ exit: e[1], to: e[2], when: e[3]?.trim() });
      else bad();
      continue;
    }
    if (!/^[-*]\s/.test(line)) continue;
    const actor = section === 'actors' && line.match(/^[-*]\s+([\w-]+):\s*(.+)$/);
    const goal = section === 'goals' && line.match(/^[-*]\s+(C\d+)\s+([\w-]+):\s*(.+?)\s*(?:→|->)\s*(.+)$/);
    const invariant = section === 'invariants' && line.match(/^[-*]\s+(I\d+)\s*\(([^)]*)\):\s*(.+)$/);
    const observation = section === 'observations' && line.match(/^[-*]\s+(O\d+):\s*(.+)$/);
    const check = journey && !step && inChecks && line.match(/^[-*]\s+([\w/-]+):\s*(.*)$/);
    const criterion = step && line.match(/^[-*]\s+(c\d+):\s*(.+)$/);
    if (actor) spec.actors.push({ id: actor[1], name: actor[2] });
    else if (goal) {
      const [, id, owner, text, target] = goal;
      const excluded = target.match(/^excluded\s+(X\d+)$/), other = target.match(/^(unresolved|elsewhere)\b\s*(?:—|–|--?|:)?\s*(.*)$/);
      if (excluded) spec.goals.push({ id, actor: owner, goal: text, status: 'excluded', journeys: [], decision: excluded[1] });
      else if (other) spec.goals.push({ id, actor: owner, goal: text, status: other[1] as Goal['status'], journeys: [], reason: other[2] });
      else if (list(target).every(j => /^J\d+$/.test(j))) spec.goals.push({ id, actor: owner, goal: text, status: 'mapped', journeys: list(target) });
      else bad();
    } else if (invariant) spec.invariants.push({ id: invariant[1], basis: list(invariant[2]), rule: invariant[3] });
    else if (observation) {
      const [statement, ...sources] = observation[2].split(/\s*Source:\s*/);
      spec.observations.push({ id: observation[1], statement: statement.trim(), sources: sources.map(s => {
        const src = s.replace(/;\s*$/, '').match(/^(\S+)@(\S+)\s+(.+)$/);
        return src ? { ref: src[1], revision: src[2], locator: src[3] } : {};
      }) });
    } else if (journey && check) {
      if (journey.checks[check[1]]) errors.push(`${journey.id}: duplicate ${check[1]} check`);
      journey.checks[check[1]] = parseCheck(check[2].trim());
    } else if (step && criterion) step.criteria.push([criterion[1], criterion[2]]);
    else bad();
  }
  return { spec, errors };
}

// Every decision the spec cites, following resolved questions to their answers.
function cited(spec: Spec, decisions: Map<string, Decision>) {
  const ids = new Set<string>();
  const visit = (id: string) => {
    if (!/^[DXQ]\d+$/.test(id) || ids.has(id)) return;
    ids.add(id);
    const answer = decisions.get(id)?.answer;
    if (answer) visit(answer);
  };
  for (const inv of spec.invariants) inv.basis.forEach(visit);
  for (const j of spec.journeys) {
    for (const st of j.steps) st.basis.forEach(visit);
    for (const c of Object.values(j.checks)) c.refs.forEach(visit);
  }
  for (const g of spec.goals) if (g.decision) visit(g.decision);
  return [...ids].sort();
}

// Covers the parsed structure and the text of every cited decision, so editing
// policy or journeys invalidates an approval; editing prose does not.
export function approvalHash(spec: Spec, decisions: Map<string, Decision>) {
  const rest = { ...spec, approval: undefined };
  const policy = cited(spec, decisions).map(id => { const d = decisions.get(id); return d ? [id, d.status, d.text] : [id]; });
  return new Bun.CryptoHasher('sha256').update(JSON.stringify([rest, policy])).digest('hex').slice(0, 8);
}

// Lays each step beside the full text it rests on, so a reader can judge meaning:
// does the policy support every criterion, and does anything contradict it?
export function reviewPacket(spec: Spec, decisions: Map<string, Decision>) {
  const observations = new Map(spec.observations.map(o => [o.id, o.statement]));
  const invariants = new Map(spec.invariants.map(i => [i.id, i.rule]));
  const criteria = new Map(spec.journeys.flatMap(j => j.steps.flatMap(st => st.criteria.map(([k, v]) => [`${st.id}.${k}`, v] as const))));
  const describe = (id: string): string => {
    if (observations.has(id)) return `${id} (observed): ${observations.get(id)}`;
    if (invariants.has(id)) return `${id} (invariant): ${invariants.get(id)}`;
    if (criteria.has(id)) return `${id}: ${criteria.get(id)}`;
    const d = decisions.get(id);
    if (!d) return `${id}: step or unknown reference`;
    return `${id} (${d.status}): ${d.text}${d.answer ? `\n  - ${describe(d.answer)}` : ''}`;
  };
  const out = [`# Review: ${spec.feature}`, '',
    'For each step: does every criterion follow from what it rests on, is each criterion one behavior,',
    'and does any cited text contradict another? Fix the spec or raise a question; do not just note it.', ''];
  if (spec.invariants.length) out.push('## Invariants', '');
  for (const i of spec.invariants) out.push(`### ${i.id}: ${i.rule}`, ...i.basis.map(b => `- ${describe(b)}`), '');
  for (const j of spec.journeys) {
    out.push(`## ${j.id}: ${j.title}`, '');
    for (const st of j.steps) {
      out.push(`### ${st.id} ${st.title} (${st.kind})`, 'Rests on:', ...st.basis.map(b => `- ${describe(b)}`));
      if (st.guards.length) out.push('Guards:', ...st.guards.map(g => `- ${describe(g)}`));
      out.push('Criteria:', ...st.criteria.map(([k, v]) => `- ${st.id}.${k}: ${v}`), '');
    }
    out.push('Checks:');
    for (const name of checkNames) {
      const c = j.checks[name];
      out.push(`- ${name}: ${!c ? 'missing' : c.status === 'covered' ? '' : `${c.status} — ${c.reason}`}`);
      for (const ref of c?.refs ?? []) out.push(`  - ${describe(ref)}`);
    }
    out.push('');
  }
  return out.join('\n');
}

export function validate(spec: Spec, decisions: Map<string, Decision>, ready = false, approving = false) {
  const errors: string[] = [], warnings: string[] = [], rules = new Set<string>();
  const screens = new Map<string, string[]>();
  const err = (m: string) => errors.push(m);
  const gate = (m: string) => (ready ? errors : warnings).push(m);
  const ids = new Set<string>();
  const add = (id: string) => { if (ids.has(id)) err(`Duplicate ID ${id}`); ids.add(id); };
  const rule = (text: string, id: string) => {
    add(id); rules.add(id);
    if (!ears.test(text)) err(`${id}: expected EARS behavior (WHEN/IF/WHILE ... THE SYSTEM SHALL ...)`);
    else if ((text.match(/\bSHALL\b/g) ?? []).length > 1) warnings.push(`${id}: more than one SHALL; split it into one behavior per criterion`);
    else if (/\b(promptly|as needed|quickly|appropriately|properly|gracefully)\b/i.test(text.replace(/"[^"]*"|`[^`]*`/g, ''))) warnings.push(`${id}: vague requirement; name an observable outcome`);
  };
  // Draft and open citations are reported once per decision, not once per citation.
  const unresolved = new Map<string, string[]>();
  const policy = (id: string, owner: string) => {
    const d = decisions.get(id);
    if (!d) err(`${owner}: unknown decision ${id}`);
    else if (d.status === 'resolved' && d.answer) policy(d.answer, owner);
    else if (d.status === 'resolved') err(`${owner}: ${id} is resolved; add "Answered by D<n>" to it`);
    else if (['superseded', 'retired'].includes(d.status)) err(`${owner}: inactive decision ${id}`);
    else if (d.status !== 'accepted') unresolved.set(id, [...(unresolved.get(id) ?? []), owner]);
  };
  const observationIds = new Set(spec.observations.map(o => o.id));
  const basis = (refs: string[], owner: string) => {
    if (!refs.length) { err(`${owner}: needs a Basis (decisions or observations)`); return; }
    for (const ref of refs) {
      if (/^O\d+$/.test(ref)) { if (!observationIds.has(ref)) err(`${owner}: unknown observation ${ref}`); }
      else if (/^[DXQ]\d+$/.test(ref)) policy(ref, owner);
      else err(`${owner}: invalid basis ${ref}`);
    }
    if (ready && !refs.some(r => /^[DX]\d+$/.test(r) || decisions.get(r)?.answer)) err(refs.some(r => r.startsWith('O'))
      ? `${owner}: observations are not approved policy; cite an accepted decision`
      : `${owner}: needs an accepted decision in Basis`);
  };

  if (!spec.feature) err('Missing "# Feature" title');
  const actorIds = new Set<string>();
  if (!spec.actors.length) err('Actors section needs at least one actor');
  for (const a of spec.actors) { if (actorIds.has(a.id)) err(`Duplicate actor ${a.id}`); actorIds.add(a.id); }
  for (const o of spec.observations) {
    add(o.id);
    if (!o.statement) err(`${o.id}: missing observation statement`);
    if (!o.sources.length || o.sources.some(s => !s.ref || !s.revision || !s.locator)) err(`${o.id}: each observation needs "Source: path@revision locator"`);
  }
  const invariantIds = new Set<string>();
  for (const inv of spec.invariants) { invariantIds.add(inv.id); rule(inv.rule, inv.id); basis(inv.basis, inv.id); }

  const journeyIds = new Set<string>(), stepIds = new Set<string>();
  if (!spec.journeys.length) err('Needs at least one "## J1: Title" journey');
  for (const j of spec.journeys) {
    add(j.id); journeyIds.add(j.id);
    if (!j.actor || !actorIds.has(j.actor)) err(`${j.id}: unknown actor ${j.actor ?? '(missing Actor:)'}`);
    if (!j.exits.length) err(`${j.id}: needs Exits`);
    if (new Set(j.exits).size !== j.exits.length) err(`${j.id}: duplicate exits`);
    if (!j.steps.length) { err(`${j.id}: needs at least one step`); continue; }
    const graph = new Map<string, string[]>(), terminals = new Set<string>();
    for (const st of j.steps) {
      add(st.id); stepIds.add(st.id); graph.set(st.id, []);
      if (!st.id.startsWith(`${j.id}.`)) err(`${st.id}: wrong journey prefix`);
      if (st.kind === 'person' && !st.screen) err(`${st.id}: person step needs a Screen`);
      for (const screen of st.screen?.split(/\s*;\s*/) ?? []) screens.set(screen, [...(screens.get(screen) ?? []), st.id]);
      basis(st.basis, st.id);
      for (const inv of st.guards) if (!invariantIds.has(inv)) err(`${st.id}: unknown invariant ${inv}`);
      if (!st.criteria.length) err(`${st.id}: needs criteria ("- c1: WHEN ... THE SYSTEM SHALL ...")`);
      for (const [key, text] of st.criteria) rule(text, `${st.id}.${key}`);
      if (st.guards.length && !st.criteria.some(([, text]) => forbidden.test(text))) err(`${st.id}: guarded step needs a forbidden-effect criterion (IF ... THE SYSTEM SHALL NOT ...)`);
      if (!st.edges.length) err(`${st.id}: needs a "→ J<n>.S<n>" or "→ exit <name>" line`);
      for (const e of st.edges) {
        if (st.edges.length > 1 && !e.when) err(`${st.id}: each of several branches needs a when`);
        if (e.to) { if (j.steps.some(s => s.id === e.to)) graph.get(st.id)?.push(e.to); else err(`${st.id}: missing target ${e.to}`); }
        else if (!e.exit || !j.exits.includes(e.exit)) err(`${st.id}: unknown exit ${e.exit}`);
        else terminals.add(st.id);
      }
    }
    const reached = new Set<string>(), pending = [j.steps[0].id];
    for (let id = pending.pop(); id !== undefined; id = pending.pop()) { if (reached.has(id)) continue; reached.add(id); pending.push(...(graph.get(id) ?? [])); }
    for (const id of graph.keys()) if (!reached.has(id)) err(`${id}: unreachable from ${j.steps[0].id}`);
    const canExit = new Set(terminals);
    let changed = true;
    while (changed) { changed = false; for (const [id, edges] of graph) if (!canExit.has(id) && edges.some(e => canExit.has(e))) { canExit.add(id); changed = true; } }
    for (const id of graph.keys()) if (!canExit.has(id)) err(`${id}: no path to an exit`);
  }

  // Owner outcome checks. Refs may cite any step, criterion, invariant or decision.
  for (const j of spec.journeys) {
    for (const name of Object.keys(j.checks)) if (!checkNames.includes(name)) err(`${j.id}: unknown check ${name}`);
    for (const name of checkNames) {
      const c = j.checks[name];
      if (!c) { gate(`${j.id}: missing ${name} check`); continue; }
      if (c.status !== 'covered' && !c.reason) err(`${j.id}/${name}: ${c.status} needs a reason`);
      if (c.status === 'open') gate(`${j.id}/${name}: check is open`);
      if (c.status === 'covered' && !c.refs.length) err(`${j.id}/${name}: needs refs, n/a — reason, or open — reason`);
      for (const ref of c.refs) {
        if (/^[DXQ]\d+$/.test(ref)) policy(ref, `${j.id}/${name}`);
        else if (!rules.has(ref) && !stepIds.has(ref)) err(`${j.id}/${name}: unknown check ref ${ref}`);
      }
    }
  }

  if (!spec.goals.length) gate('Missing Goals section (coverage inventory)');
  const mapped = new Set<string>();
  for (const g of spec.goals) {
    add(g.id);
    if (!actorIds.has(g.actor)) err(`${g.id}: unknown actor ${g.actor}`);
    if (g.status === 'mapped') for (const id of g.journeys) journeyIds.has(id) ? mapped.add(id) : err(`${g.id}: missing mapped journey ${id}`);
    if (g.status !== 'mapped' && g.status !== 'excluded' && !g.reason) err(`${g.id}: ${g.status} goal needs a reason`);
    if (g.status === 'unresolved') gate(`${g.id}: unresolved goal`);
    if (g.status === 'excluded') {
      const d = g.decision ? decisions.get(g.decision) : undefined;
      if (!d || ['superseded', 'retired'].includes(d.status)) err(`${g.id}: exclusion must cite an active X decision`);
      else if (d.status !== 'accepted') gate(`${g.id}: exclusion ${g.decision} is not accepted`);
    }
  }
  if (spec.goals.length) for (const id of journeyIds) if (!mapped.has(id)) gate(`${id}: journey missing from Goals`);

  // Listed first: an open owner decision matters more than any other warning.
  (ready ? errors : warnings).unshift(...[...unresolved].map(([id, owners]) =>
    `${id} is ${decisions.get(id)?.status}; cited by ${owners.slice(0, 8).join(', ')}${owners.length > 8 ? ` and ${owners.length - 8} more` : ''}`));

  if (new Set(spec.retired).size !== spec.retired.length) err('Duplicate retired IDs');
  for (const id of spec.retired) {
    if (!/^([IOC]\d+|J\d+(\.S\d+[a-z]?(\.c\d+)?)?)$/.test(id)) err(`Invalid retired ID ${id}`);
    if (ids.has(id)) err(`Retired ID reused: ${id}`);
  }

  // Every accepted decision in Scope must be cited somewhere, so a decided rule cannot go unmapped.
  const citedIds = new Set(cited(spec, decisions));
  for (const id of spec.scope) {
    const d = decisions.get(id);
    if (!/^[DX]\d+$/.test(id) || !d) err(`Scope: unknown decision ${id}`);
    else if (d.status === 'accepted' && id !== spec.approval?.id && !citedIds.has(id)) gate(`Scope: ${id} is accepted but no goal, step, invariant or check cites it`);
  }

  if (!approving) {
    const a = spec.approval;
    if (!a) { if (ready) err('Not approved: after owner sign-off, add an accepted D and run approve'); }
    else if (decisions.get(a.id)?.status !== 'accepted') gate(`Approval ${a.id} is not an accepted decision`);
    else if (a.hash !== approvalHash(spec, decisions)) gate(`Approval ${a.id} is stale: the journeys or the decisions they cite changed since sign-off; re-approve`);
  }
  return { errors, warnings, rules, screens };
}

// Task plans: "## T1 Title" sections with "Covers:" and "Needs:" lines, an optional
// index table with a Needs column, and a Source line linking the journeys file with
// the approval it was built on: "Source: [journeys](../journeys/x.md), approved by D11 b6fa08c8".
export type Task = { id: string; covers: string[]; needs: string[]; indexNeeds?: string[]; section: boolean; verify: boolean; status?: string; parallel?: string };
const taskId = /\bT(?:\d+|-[A-Za-z0-9][\w-]*)\b/g;
const specRef = /\b(?:J\d+(?:\.S\d+[a-z]?(?:\.c\d+)?)?|I\d+)\b/g;
// Parenthetical notes such as "I2 (issuing links)" or "(after T-REMINDERS)" are prose.
const refsIn = (text: string, pattern: RegExp) => text.replace(/\([^)]*\)/g, '').match(pattern) ?? [];
export function parseTasks(markdown: string) {
  const tasks = new Map<string, Task>(), errors: string[] = [];
  const source: { path?: string; approval?: string } = {};
  const get = (id: string, section: boolean) => {
    const existing = tasks.get(id);
    if (existing && section && existing.section) errors.push(`Duplicate task ${id}`);
    const task = existing ?? { id, covers: [], needs: [], section, verify: false };
    task.section ||= section;
    tasks.set(id, task);
    return task;
  };
  let current: Task | undefined, headers: string[] = [], verifyFollows = false;
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    // "Verify:" may introduce a list on the following lines.
    if (current && verifyFollows && line) { current.verify ||= !/^[A-Z][a-z]+\b[^:]*:\s*$/.test(line) && !line.startsWith('#'); verifyFollows = false; }
    const src = !current && line.match(/^Source:.*?\]\(([^)]+\.md)[^)]*\)(?:.*?\bapproved by D\d+\s+([0-9a-f]{8}))?/i);
    if (src) { source.path = src[1]; source.approval = src[2]; continue; }
    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      const cell = (h: string) => headers.includes(h) ? cells[headers.indexOf(h)] ?? '' : undefined;
      if (cells[0] === 'ID') headers = cells;
      else if (/^T(?:\d+|-[\w-]+)$/.test(cells[0] ?? '')) {
        const task = get(cells[0], false);
        const needs = cell('Needs');
        if (needs !== undefined) task.indexNeeds = refsIn(needs, taskId);
        task.status ??= cell('Status');
        task.parallel ??= cell('Parallel');
      }
      continue;
    }
    const heading = line.match(/^## (T(?:\d+|-[\w-]+))\b/);
    if (heading) { current = get(heading[1], true); continue; }
    if (line.startsWith('## ')) { current = undefined; continue; }
    const field = current && line.match(/^(Covers|Needs|Verify|Status|Parallel)\b(?:\s*\([^)]*\))?:\s*(.*)$/);
    if (current && field) {
      if (field[1] === 'Covers') current.covers.push(...refsIn(field[2], specRef));
      else if (field[1] === 'Needs') current.needs.push(...refsIn(field[2], taskId));
      else if (field[1] === 'Verify') { current.verify ||= field[2].trim().length > 0; verifyFollows = !field[2].trim(); }
      else if (field[1] === 'Status') current.status = field[2].trim();
      else current.parallel = field[2].trim();
    }
  }
  for (const t of tasks.values()) {
    if (t.indexNeeds && t.section && t.needs.length && [...new Set(t.indexNeeds)].sort().join() !== [...new Set(t.needs)].sort().join())
      errors.push(`${t.id}: index Needs (${t.indexNeeds.join(', ') || '—'}) and section Needs (${t.needs.join(', ')}) disagree`);
    if (!t.needs.length) t.needs = t.indexNeeds ?? [];
  }
  return { tasks: [...tasks.values()], source, errors };
}

export function validateTasks(tasks: Task[], source: { approval?: string }, spec: Spec, decisions: Map<string, Decision>) {
  const errors: string[] = [], warnings: string[] = [];
  const journeys = new Map(spec.journeys.map(j => [j.id, j]));
  const steps = new Map(spec.journeys.flatMap(j => j.steps.map(st => [st.id, st] as const)));
  const targets = [...spec.journeys.flatMap(j => j.steps.flatMap(st => st.criteria.map(([k]) => `${st.id}.${k}`))), ...spec.invariants.map(i => i.id)];
  const owners = new Map(targets.map(id => [id, [] as string[]]));
  const ids = new Set(tasks.map(t => t.id));
  for (const t of tasks) {
    if (!t.section) warnings.push(`${t.id}: listed in the index but has no "## ${t.id}" section`);
    else if (!t.covers.length) errors.push(`${t.id}: needs a Covers line naming journeys, steps, criteria or invariants`);
    for (const ref of new Set(t.covers)) {
      const covered = journeys.get(ref)?.steps.flatMap(st => st.criteria.map(([k]) => `${st.id}.${k}`))
        ?? steps.get(ref)?.criteria.map(([k]) => `${ref}.${k}`)
        ?? (owners.has(ref) ? [ref] : undefined);
      if (!covered) errors.push(`${t.id}: covers unknown ${ref}`);
      for (const id of covered ?? []) owners.get(id)?.push(t.id);
    }
    for (const need of new Set(t.needs)) {
      if (need === t.id) errors.push(`${t.id}: needs itself`);
      else if (!ids.has(need)) errors.push(`${t.id}: needs unknown task ${need}; name work outside this plan in its Blocked reason`);
    }
    if (t.section && !t.verify) errors.push(`${t.id}: needs a Verify line with a command or exact check`);
    if (/^blocked\s*$/i.test(t.status ?? '')) warnings.push(`${t.id}: Blocked needs a reason, such as "Blocked (Q4)"`);
    if (/^start now/i.test(t.parallel ?? '') && t.needs.length) warnings.push(`${t.id}: marked start now but needs ${t.needs.join(', ')}`);
  }
  const blocked = new Set(tasks.filter(t => /^blocked/i.test(t.status ?? '')).map(t => t.id));
  const onlyBlocked = [...owners].filter(([, by]) => by.length && by.every(id => blocked.has(id))).map(([id]) => id);
  if (onlyBlocked.length) warnings.push(`Owned only by blocked tasks: ${onlyBlocked.join(', ')}`);
  for (const [id, by] of owners) {
    if (!by.length) errors.push(`${id}: no task covers it`);
    else if (new Set(by).size > 1 && !id.startsWith('I')) warnings.push(`${id}: covered by ${[...new Set(by)].join(' and ')}; give one task ownership`);
  }
  // Dependency cycles make the order impossible.
  const state = new Map<string, 'open' | 'done'>(), byId = new Map(tasks.map(t => [t.id, t]));
  const visit = (id: string, path: string[]) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'open') { errors.push(`Dependency cycle: ${[...path.slice(path.indexOf(id)), id].join(' → ')}`); return; }
    state.set(id, 'open');
    for (const need of byId.get(id)?.needs ?? []) if (byId.has(need)) visit(need, [...path, id]);
    state.set(id, 'done');
  };
  for (const t of tasks) visit(t.id, []);
  // The plan must be built on the journeys' current approval.
  const current = approvalHash(spec, decisions);
  if (!spec.approval) warnings.push('Journeys are not approved; plan only what the owner asks for');
  else if (spec.approval.hash !== current) errors.push(`Journeys approval ${spec.approval.id} is stale; re-approve the journeys before planning`);
  else if (!source.approval) warnings.push(`Stamp the approval in the Source line: "approved by ${spec.approval.id} ${spec.approval.hash}"`);
  else if (source.approval !== spec.approval.hash) errors.push(`Plan was built on approval ${source.approval}; the journeys are now approved as ${spec.approval.hash}. Re-plan the affected tasks and update the Source line`);
  return { errors, warnings, covered: targets.length - [...owners.values()].filter(by => !by.length).length, total: targets.length };
}

if (import.meta.main) {
  try {
    const usage = 'Usage: bun journeys.ts check feature.md [--ready] [--verbose] [--review] | approve feature.md D<n> | tasks tasks.md';
    const [cmd, input, ...rest] = process.argv.slice(2);
    if (['.yaml', '.yml'].includes(extname(input ?? ''))) throw Error(`${input} uses the retired YAML format; write the journeys as Markdown (see references/format.md)`);
    if (!['check', 'approve', 'tasks'].includes(cmd) || !input || extname(input) !== '.md') throw Error(usage);
    const snapshotRoot = process.env.JOURNEYS_SNAPSHOT_ROOT;
    const read = async (path: string) => Bun.file(await snapshotRead(path, snapshotRoot)).text();
    if (cmd === 'tasks') {
      const plan = parseTasks(await read(input));
      if (!plan.source.path) throw Error('Add a Source line linking the journeys file: "Source: [journeys](../journeys/<feature>.md), approved by D<n> <hash>"');
      const journeysPath = resolve(dirname(input), plan.source.path);
      const parsedSpec = parseJourneys(await read(journeysPath));
      const record = parsedSpec.spec.decisions ? parseDecisions(await read(resolve(dirname(journeysPath), parsedSpec.spec.decisions))) : { decisions: new Map<string, Decision>(), errors: [] };
      const result = validateTasks(plan.tasks, plan.source, parsedSpec.spec, record.decisions);
      for (const w of result.warnings) console.error(`warn: ${w}`);
      const errors = [...plan.errors, ...parsedSpec.errors.map(e => `journeys ${e}`), ...record.errors, ...result.errors];
      if (errors.length) throw Error(errors.join('\n'));
      console.log(`ok: tasks ${input}; ${plan.tasks.length} tasks; ${result.covered} of ${result.total} criteria and invariants have an owner.${plan.source.approval ? ` Built on approval ${plan.source.approval}.` : ''} Ownership only; nothing was verified.`);
      process.exit(0);
    }
    const text = await read(input);
    const { spec, errors: parseErrors } = parseJourneys(text);
    const parsed = spec.decisions ? parseDecisions(await read(resolve(dirname(input), spec.decisions))) : { decisions: new Map<string, Decision>(), errors: [] };
    if (cmd === 'approve') {
      const id = rest[0];
      if (!/^D\d+$/.test(id ?? '') || rest.length !== 1) throw Error(usage);
      const errors = [...parseErrors, ...parsed.errors, ...validate(spec, parsed.decisions, true, true).errors];
      if (parsed.decisions.get(id)?.status !== 'accepted') errors.push(`${id}: record the owner's sign-off as an accepted decision first`);
      if (errors.length) throw Error(errors.join('\n'));
      const stamp = `Approved: ${id} ${approvalHash(spec, parsed.decisions)}`, lines = text.split('\n');
      const existing = lines.findIndex(l => /^Approved:/.test(l.trim()));
      if (existing >= 0) lines[existing] = stamp;
      else {
        const decisionsLine = lines.findIndex(l => /^Decisions:/.test(l.trim()));
        if (decisionsLine >= 0) lines.splice(decisionsLine + 1, 0, stamp);
        else lines.splice(lines.findIndex(l => /^# /.test(l)) + 1, 0, '', stamp);
      }
      await Bun.write(input, lines.join('\n'));
      console.log(`ok: ${input} approved by ${id}. Changing the journeys or the decisions they cite makes this approval stale.`);
    } else {
      for (const flag of rest) if (!['--ready', '--verbose', '--review'].includes(flag)) throw Error(`Unknown option ${flag}`);
      if (rest.includes('--review')) {
        console.log(reviewPacket(spec, parsed.decisions));
        process.exit(0);
      }
      const ready = rest.includes('--ready');
      const result = validate(spec, parsed.decisions, ready);
      const shown = rest.includes('--verbose') ? result.warnings : result.warnings.slice(0, 8);
      for (const w of shown) console.error(`warn: ${w}`);
      if (shown.length < result.warnings.length) console.error(`warn: ${result.warnings.length - shown.length} more warnings; use --verbose for all.`);
      const errors = [...parseErrors, ...parsed.errors, ...result.errors];
      if (errors.length) throw Error(errors.join('\n'));
      const screens = [...result.screens].map(([screen, steps]) => `${screen} (${steps.join(', ')})`).join('; ');
      console.log(`ok: ${ready ? 'ready' : 'draft'} check ${input}; ${result.rules.size} rules; ${result.warnings.length} warnings.${ready ? ` Approved by ${spec.approval?.id}.` : ''} Tests were not run.`);
      if (screens) console.log(`screens: ${screens}`);
    }
  } catch (e) {
    for (const line of String(e instanceof Error ? e.message : e).split('\n')) console.error(`ERROR: ${line}`);
    process.exit(1);
  }
}
