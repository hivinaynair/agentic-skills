import {resolve, dirname} from 'node:path';
for (const name of ['decide', 'journeys', 'tasks']) {
  const root = `skills/${name}`;
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
      if (!await Bun.file(resolve(dirname(file), link.split('#')[0])).exists()) throw Error(`${file}: missing reference ${link}`);
    }
  }
  console.log(`ok: ${name} metadata and local references`);
}
