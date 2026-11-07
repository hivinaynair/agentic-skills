import { expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const checker = join(
  import.meta.dir,
  "../skills/verify/scripts/check-design-coverage.ts",
);
const desktop = "Account settings · Desktop · Loaded";
const phone = "Account settings · Phone · Loaded";
const reach = { route: "/settings/account", setup: "bun run seed:demo" };
const artboards = [
  { name: desktop, device: "Desktop", ...reach },
  { name: phone, device: "Phone", ...reach },
];
const inventory = { requiredDevices: ["Desktop", "Phone"], artboards };
const desktopMatch = {
  artboard: desktop,
  status: "matched",
  designReference: "https://example.test/design/account-settings",
  browserScreenshot: "desktop.png",
};
const phoneMatch = {
  ...desktopMatch,
  artboard: phone,
  browserScreenshot: "phone.png",
};
const keptDateInput = {
  id: "E1",
  artboards: [phone],
  detail: "Keeps the native date input",
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
  {
    name: "rejects a desktop-only inventory when phone is required",
    approved: { ...inventory, artboards: artboards.slice(0, 1) },
    error: "Missing approved artboard for required device Phone",
  },
  {
    name: "accepts an explicitly desktop-only scope",
    approved: {
      requiredDevices: ["Desktop"],
      artboards: artboards.slice(0, 1),
    },
    error: "",
  },
  {
    name: "rejects a board with no route or setup",
    approved: {
      ...inventory,
      artboards: [artboards[0], { name: phone, device: "Phone" }],
    },
    error: `${phone}: missing route\n${phone}: missing setup`,
  },
  {
    name: "rejects a loading board paired with an unknown board",
    approved: {
      ...inventory,
      artboards: [
        ...artboards,
        {
          name: "Account settings · Phone · Loading",
          device: "Phone",
          ...reach,
          loadingFor: "Account settings · Phone · Done",
        },
      ],
    },
    error: "loadingFor names unknown board",
  },
  {
    name: "rejects a reused component with no code mapping",
    approved: {
      ...inventory,
      components: [{ design: "Button · primary", use: "reuse" }],
    },
    error: "Button · primary: reuse needs the code it maps to",
  },
  {
    name: "accepts a deviation approved by an exception",
    approved: { ...inventory, exceptions: [keptDateInput] },
    results: [
      desktopMatch,
      { ...phoneMatch, status: "deviation", exception: "E1", note: "Per E1" },
    ],
    error: "",
  },
  {
    name: "rejects a deviation the exception does not cover",
    approved: { ...inventory, exceptions: [keptDateInput] },
    results: [
      { ...desktopMatch, status: "deviation", exception: "E1", note: "Per E1" },
      phoneMatch,
    ],
    error: `${desktop}: deviation needs an exception that lists this board`,
  },
])("$name", async ({ results, error, approved = inventory }) => {
  const directory = await mkdtemp(join(tmpdir(), "design-coverage-"));
  try {
    const approvedPath = join(directory, "handoff.json");
    const report = join(directory, "coverage.json");
    await Promise.all([
      writeFile(approvedPath, JSON.stringify(approved)),
      writeFile(report, JSON.stringify(results ?? [])),
      writeFile(join(directory, "desktop.png"), "desktop screenshot fixture"),
      writeFile(join(directory, "phone.png"), "phone screenshot fixture"),
    ]);
    const result = Bun.spawnSync(
      [
        process.execPath,
        checker,
        approvedPath,
        results ? report : "--inventory-only",
      ],
      {
        cwd: tmpdir(),
      },
    );
    expect(result.exitCode).toBe(error ? 1 : 0);
    if (error) expect(result.stderr.toString()).toContain(error);
    else
      expect(result.stdout.toString()).toContain(
        results ? "approved artboards matched" : "Handoff valid",
      );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
