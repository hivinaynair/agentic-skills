import { expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const checker = join(
  import.meta.dir,
  "../skills/verify/scripts/check-paper-coverage.ts",
);
const desktop = "Admissions · Worklist · Desktop · Populated";
const phone = "Admissions · Worklist · Phone · Loading";
const desktopMatch = {
  artboard: desktop,
  status: "matched",
  paperReference: "https://example.test/paper/admissions",
  browserScreenshot: "desktop.png",
};
const phoneMatch = {
  ...desktopMatch,
  artboard: phone,
  browserScreenshot: "phone.png",
};

test.each([
  {
    name: "reports an omitted approved artboard",
    results: [desktopMatch],
    error: `Missing result for ${phone}`,
  },
  {
    name: "reports a blocked artboard",
    results: [desktopMatch, { artboard: phone, status: "blocked" }],
    error: `${phone}: blocked`,
  },
  {
    name: "rejects a match with missing evidence",
    results: [
      desktopMatch,
      { ...phoneMatch, browserScreenshot: "missing.png" },
    ],
    error: `${phone}: browser screenshot`,
  },
  {
    name: "accepts evidence for the entire handoff",
    results: [desktopMatch, phoneMatch],
    error: "",
  },
])("$name", async ({ results, error }) => {
  const directory = await mkdtemp(join(tmpdir(), "paper-coverage-"));
  try {
    const approved = join(directory, "approved.json");
    const report = join(directory, "coverage.json");
    await Promise.all([
      writeFile(approved, JSON.stringify([desktop, phone])),
      writeFile(report, JSON.stringify(results)),
      writeFile(join(directory, "desktop.png"), "desktop screenshot fixture"),
      writeFile(join(directory, "phone.png"), "phone screenshot fixture"),
    ]);
    const result = Bun.spawnSync(
      [process.execPath, checker, approved, report],
      {
        cwd: tmpdir(),
      },
    );
    expect(result.exitCode).toBe(error ? 1 : 0);
    if (error) expect(result.stderr.toString()).toContain(error);
    else
      expect(result.stdout.toString()).toContain(
        "2/2 approved artboards matched",
      );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
