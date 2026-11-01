#!/usr/bin/env node
// Turns Playwright's JSON report into the pull request comment: one row per
// journey test, its result, and where its video and trace are.
// Usage: node scripts/journey-report.mjs e2e/report/results.json [download-url]
import { readFileSync } from 'node:fs';

const [file, download] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/journey-report.mjs <results.json> [download-url]');
  process.exit(1);
}
const report = JSON.parse(readFileSync(file, 'utf8'));
const label = { expected: 'passed', unexpected: 'failed', flaky: 'flaky', skipped: 'skipped' };
const rows = [];
const walk = (suite) => {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const last = test.results?.at(-1);
      const has = (name) => last?.attachments?.some((a) => a.name === name) ?? false;
      rows.push({ title: spec.title, status: label[test.status] ?? test.status, video: has('video'), trace: has('trace') });
    }
  }
  for (const child of suite.suites ?? []) walk(child);
};
for (const suite of report.suites ?? []) walk(suite);

const id = (title) => title.match(/^(J\d+(?:\.S\d+[a-z]?)?(?:\.c\d+)?|I\d+)\b/)?.[1];
// Failures first, then by journey ID.
const rank = (r) => ({ failed: 0, flaky: 1 }[r.status] ?? 2);
const order = (a, b) => rank(a) - rank(b) || (id(a.title) ?? '~').localeCompare(id(b.title) ?? '~', undefined, { numeric: true }) || a.title.localeCompare(b.title);
const journeys = rows.filter((r) => id(r.title)).sort(order);
const others = rows.length - journeys.length;
const count = (status) => rows.filter((r) => r.status === status).length;
const mark = { passed: '✅ passed', failed: '❌ failed', flaky: '⚠️ flaky', skipped: '⏭️ skipped' };

const out = ['<!-- journey-recordings -->', '## Journey recordings', ''];
out.push(`${count('passed')} passed, ${count('failed')} failed, ${count('flaky')} flaky, ${count('skipped')} skipped.`);
if (download) out.push(`Videos, traces and the HTML report: [download](${download}). Open a trace at https://trace.playwright.dev.`);
out.push('');
if (journeys.length) {
  out.push('| Journey | Result | Recorded |', '|---|---|---|');
  for (const r of journeys) out.push(`| ${r.title.replaceAll('|', '/')} | ${mark[r.status] ?? r.status} | ${[r.video && 'video', r.trace && 'trace'].filter(Boolean).join(', ') || '—'} |`);
} else out.push('No test is named after a journey yet. Name tests like `J3: pay with coins at checkout`.');
if (others) out.push('', `${others} other ${others === 1 ? 'test is' : 'tests are'} not named after a journey.`);
console.log(out.join('\n'));
