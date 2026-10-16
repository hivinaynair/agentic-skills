import {dirname, resolve} from 'node:path';

// Optional measurement tool. Load the tokenizer from an external temporary install;
// no tokenizer dependency is added to the skills or validator.
const [baseline, modulePath] = process.argv.slice(2);
if (!baseline || !modulePath) throw Error('Usage: bun count.ts <baseline-commit> <path-to-o200k_base.js>');
const entry = resolve(modulePath);
const {encode} = await import(entry);
const packageInfo = await Bun.file(resolve(dirname(entry), '../../package.json')).json();
const repo = resolve(import.meta.dir, '../..');
const files = [
  'skills/decide/SKILL.md', 'skills/decide/references/record-format.md',
  'skills/journeys/SKILL.md', 'skills/journeys/references/branches.md',
  'skills/journeys/references/existing-projects.md', 'skills/journeys/references/schema.md',
];
const counts = [];
for (const path of files) {
  const original = Bun.spawnSync(['git', 'show', `${baseline}:${path}`], {cwd:repo});
  if (original.exitCode) throw Error(`Cannot read baseline: ${path}`);
  const text = await Bun.file(resolve(repo, path)).text();
  counts.push({path, before:encode(original.stdout.toString()).length, after:encode(text).length,
    afterSha256:new Bun.CryptoHasher('sha256').update(text).digest('hex')});
}
const totals = (rows: typeof counts) => {
  const before = rows.reduce((sum, row) => sum + row.before, 0);
  const after = rows.reduce((sum, row) => sum + row.after, 0);
  return {before, after, saved:before-after, reductionPercent:Math.round((before-after)/before*1000)/10};
};
console.log(JSON.stringify({baseline, tokenizer:`${packageInfo.name}@${packageInfo.version}`,
  encoding:'o200k_base', scope:'Full files including frontmatter, counted separately; not session usage',
  counts, entrypoints:totals(counts.filter(row => row.path.endsWith('/SKILL.md'))), total:totals(counts)}, null, 2));
