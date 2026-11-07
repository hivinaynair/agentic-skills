import {resolve, dirname, basename} from 'node:path';
const core = ['decide', 'journeys', 'tasks', 'build', 'verify'].map(name => `skills/${name}`);
const extensions = [];
for await (const path of new Bun.Glob('extensions/*/skills/*/SKILL.md').scan('.')) extensions.push(dirname(path));
const extensionsRoot = resolve('extensions');
for (const root of [...core, ...extensions.sort()]) {
  const name = basename(root);
  const isCore = core.includes(root);
  const text = await Bun.file(`${root}/SKILL.md`).text();
  const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  if (!front) throw Error(`${name}: missing frontmatter`);
  const metadata = Bun.YAML.parse(front) as Record<string, unknown>;
  if (metadata.name !== name || typeof metadata.description !== 'string') throw Error(`${name}: invalid metadata`);
  for await (const path of new Bun.Glob('**/*.md').scan(root)) {
    const file = `${root}/${path}`;
    const prose = (await Bun.file(file).text()).replace(/^```[\s\S]*?^```/gm, '');
    for (const match of prose.matchAll(/\]\(([^)]+)\)/g)) {
      const link = match[1];
      if (link.includes('://') || link.startsWith('#')) continue;
      const target = resolve(dirname(file), link.split('#')[0]);
      if (!await Bun.file(target).exists()) throw Error(`${file}: missing reference ${link}`);
      if (isCore && target.startsWith(extensionsRoot)) throw Error(`${file}: core skills must not depend on an extension (${link})`);
      if (!isCore && !target.startsWith(resolve(dirname(root)))) throw Error(`${file}: link core skills by name, not path (${link})`);
    }
  }
  console.log(`ok: ${isCore ? '' : 'extension '}${name} metadata and local references`);
}
