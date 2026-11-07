// Fails a DESIGN.md that carries what belongs in other records: decision,
// journey or question IDs, links to feature records, demo data and sign-ins,
// or more words than every agent should read. It cannot judge meaning; a
// passing file still needs reading against the "What stays out" test.

const maxWords = 1500;

const rules: { pattern: RegExp; issue: string }[] = [
  {
    pattern: /\b[DJQX]\d+(?:\.[A-Za-z]*\d+)*\b/,
    issue: "cites a decision, journey or question ID",
  },
  {
    pattern: /\bdocs\/(?:decisions|journeys|tasks)\b/,
    issue: "links a feature record",
  },
  {
    pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/,
    issue: "names a sign-in or contact address",
  },
  {
    pattern: /\bseed\b|sign[- ]in as|business date|password/i,
    issue: "carries demo data or sign-ins",
  },
];

export function checkDesignMd(text: string): {
  issues: string[];
  words: number;
} {
  const issues: string[] = [];
  const front = text.match(/^---\n[\s\S]*?\n---\n/);
  if (!front) issues.push("missing token front matter");
  const body = front ? text.slice(front[0].length) : text;
  const words = body
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  if (words > maxWords) {
    issues.push(`${words} words; keep the brief under ${maxWords}`);
  }
  text.split("\n").forEach((line, index) => {
    for (const { pattern, issue } of rules) {
      const match = line.match(pattern);
      if (match) issues.push(`line ${index + 1}: ${issue} (${match[0]})`);
    }
  });
  return { issues, words };
}

if (import.meta.main) {
  try {
    const [path] = Bun.argv.slice(2);
    if (!path || Bun.argv.length !== 3) {
      throw new Error("Usage: bun check-design-md.ts <DESIGN.md>");
    }
    const { issues, words } = checkDesignMd(await Bun.file(path).text());
    if (issues.length) throw new Error(issues.join("\n"));
    console.log(
      `ok: ${path}, ${words} words, no record IDs or demo data. Meaning is not checked.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
