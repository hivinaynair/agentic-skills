import { expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkDesignMd } from "../extensions/paper/skills/paper-design-system/scripts/check-design-md.ts";

const checker = join(
  import.meta.dir,
  "../extensions/paper/skills/paper-design-system/scripts/check-design-md.ts",
);
const front = '---\nname: Brightline\ncolors:\n  primary: "#1d4e89"\n---\n';
const clean = `${front}
## Colors

| Token | Utility | Use for | Never for |
|---|---|---|---|
| \`warning\` | \`bg-warning\` | Something waits on someone | Errors |

Controls are 32px high on desktop and 44px on phone. See \`PRODUCT.md\`.
`;

test("passes a visual-only brief", () => {
  expect(checkDesignMd(clean).issues).toEqual([]);
});

test.each([
  ["cites a decision ID", "Approval needs a reason (D2).", "D2"],
  ["cites a journey step", "Follows J2.S1 for the list.", "J2.S1"],
  ["cites a criterion", "Matches J1.S1.c1.", "J1.S1.c1"],
  ["cites an open question", "Self-approval waits on Q1.", "Q1"],
  [
    "links a feature record",
    "See [expenses](docs/journeys/expenses.md).",
    "docs/journeys",
  ],
  [
    "names a sign-in",
    "Review with manager@brightline.test.",
    "manager@brightline.test",
  ],
  ["carries a seed command", "Load data with `bun run seed:demo`.", "seed"],
  ["carries a business date", "Use business date 2026-03-14.", "business date"],
])("flags a line that %s", (_name, line, found) => {
  const { issues } = checkDesignMd(`${clean}\n${line}\n`);
  expect(issues).toHaveLength(1);
  expect(issues[0]).toContain(`(${found})`);
});

test("flags a brief over 1,500 words", () => {
  const long = `${clean}\n${"word ".repeat(1500)}\n`;
  expect(checkDesignMd(long).issues[0]).toMatch(/^\d+ words/);
});

test("flags a brief with no token front matter", () => {
  expect(checkDesignMd("# Design\n").issues).toEqual([
    "missing token front matter",
  ]);
});

test("ignores token names and headings that look like IDs", () => {
  const text = `${clean}\nHeadings use \`text-h2\`; \`--spacing-d4\` is the gap.\n`;
  expect(checkDesignMd(text).issues).toEqual([]);
});

test("exits 1 with each issue, 0 when clean", async () => {
  const directory = await mkdtemp(join(tmpdir(), "design-md-"));
  const path = join(directory, "DESIGN.md");
  await writeFile(path, clean);
  let result = Bun.spawnSync([process.execPath, checker, path]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout.toString()).toContain("ok:");
  await writeFile(path, `${clean}\nPending only (D34).\n`);
  result = Bun.spawnSync([process.execPath, checker, path]);
  expect(result.exitCode).toBe(1);
  expect(result.stderr.toString()).toContain("cites a decision");
});
