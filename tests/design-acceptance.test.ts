import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { png } from "./png-fixture";

const checker = join(import.meta.dir, "../skills/verify/scripts/check-design-coverage.ts");
const hash = (bytes: Uint8Array) => new Bun.CryptoHasher("sha256").update(bytes).digest("hex");

async function scenario(change: (s: any) => void, mode = "coverage", focus?: string) {
  const directory = await mkdtemp(join(tmpdir(), "design-acceptance-"));
  try {
    const image = png(8, 6);
    const boards = ["Desktop", "Phone"].map((device, i) => ({
      id: `board-${i}`, name: `Settings · ${device} · Loaded`, screen: "Settings",
      state: "Loaded", device, route: "/settings", setup: "seed settings",
      designScreenshot: `design-${i}.png`, designHash: hash(image), designExport: "styles.json",
    }));
    const s = {
      handoff: { status: "ready", requiredDevices: ["Desktop", "Phone"],
        viewports: { Desktop: "8x6", Phone: "8x6" }, artboards: boards },
      inventory: { requiredStates: [{ screen: "Settings", state: "Loaded" }], artboards: boards.map(({ id, screen, state, device }) => ({ id, screen, state, device })) },
      scope: { feature: "Account", requiredDevices: ["Desktop", "Phone"],
        inventory: "inventory.json", handoffs: ["page.json"] },
      report: boards.map(b => ({ artboard: b.name, boardId: b.id, status: "matched",
        revision: "build-a", route: b.route, viewport: "8x6", browserScreenshot: `browser-${b.id}.png`,
        visualReview: { layout: "pass", typography: "pass", spacing: "pass", controls: "pass", content: "pass" } })),
      files: { "design-0.png": image, "design-1.png": image,
        "browser-board-0.png": image, "browser-board-1.png": image, "styles.json": '{"layout":"exported"}' } as Record<string, string | Uint8Array>,
    };
    change(s);
    for (const [name, bytes] of Object.entries(s.files)) await Bun.write(join(directory, name), bytes);
    await Bun.write(join(directory, "page.json"), JSON.stringify(s.handoff));
    await Bun.write(join(directory, "inventory.json"), JSON.stringify(s.inventory));
    await Bun.write(join(directory, "scope.json"), JSON.stringify(s.scope));
    await Bun.write(join(directory, "coverage.json"), JSON.stringify(s.report));
    const result = Bun.spawnSync([process.execPath, checker, join(directory, "scope.json"),
      mode === "coverage" ? join(directory, "coverage.json") : mode,
      ...(mode === "coverage" ? ["--revision", "build-a"] : []), ...(focus ? ["--focus", focus] : [])]);
    return { code: result.exitCode, output: result.stdout.toString() + result.stderr.toString() };
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test("accepts a reconciled scope with actual matching PNGs", async () => {
  const r = await scenario(() => {});
  expect(r.code).toBe(0);
  expect(r.output).toContain("pixel comparison passed");
});

test("focused checks preserve the scope and report partial coverage", async () => {
  const r = await scenario(s => { s.report = s.report.slice(0, 1); }, "coverage", "board-0");
  expect(r.code).toBe(0);
  expect(r.output).toContain("Focused 1/2");
  expect(r.output).toContain("partial scope");
});

test("rejects a screen absent from both design and handoff", async () => {
  const r = await scenario(s => s.inventory.requiredStates.push({ screen: "Billing", state: "Loaded" }), "--ready");
  expect(r.code).toBe(1);
  expect(r.output).toContain("Missing Billing / Loaded / Desktop");
});

test("an approved visual exception masks only its declared rectangle", async () => {
  const r = await scenario(s => {
    s.files["browser-board-0.png"] = png(8, 6, (x, y) => x < 2 ? [255, 0, 0, 255] : [x * 9, y * 11, 100, 255]);
    s.handoff.exceptions = [{ id: "E1", artboards: [s.handoff.artboards[0].name], detail: "Approved native control",
      regions: [{ x: 0, y: 0, width: 2, height: 6 }] }];
    Object.assign(s.report[0], { status: "deviation", exception: "E1", note: "Native control per E1" });
  });
  expect(r.code).toBe(0);
});

test("accepts an approved device-specific state exclusion", async () => {
  const r = await scenario(s => {
    s.handoff.artboards = s.handoff.artboards.slice(0, 1);
    s.inventory.artboards = s.inventory.artboards.slice(0, 1);
    s.inventory.deviceExclusions = [{ screen: "Settings", state: "Loaded", device: "Phone", reason: "Desktop-only settings approved by D12" }];
    s.report = s.report.slice(0, 1);
  });
  expect(r.code).toBe(0);
});

test("readiness rejects a truncated PNG even with a correct hash", async () => {
  const r = await scenario(s => {
    s.files["design-0.png"] = png(8, 6).subarray(0, 33);
    s.handoff.artboards[0].designHash = hash(s.files["design-0.png"]);
  }, "--ready");
  expect(r.code).toBe(1);
  expect(r.output).toContain("Incomplete PNG");
});

test("a page cannot be included twice in a scope", async () => {
  const r = await scenario(s => s.scope.handoffs.push("page.json"), "--ready");
  expect(r.code).toBe(1);
  expect(r.output).toContain("handed off twice");
});

test.each([
  ["a complete screen omitted from the handoff", (s: any) => s.inventory.artboards.push(
    { id: "missing", screen: "Billing", state: "Loaded", device: "Desktop" }), "Missing handoff for approved board missing"],
  ["a state missing on Phone", (s: any) => s.handoff.artboards.push(
    { ...s.handoff.artboards[0], id: "empty", name: "Settings · Desktop · Empty", state: "Empty" }), "Missing Settings / Empty / Phone"],
  ["a draft claiming complete coverage", (s: any) => {
    s.handoff.status = "draft"; s.handoff.gaps = ["Missing recovery screen"];
  }, "not ready"],
  ["an unrelated one-pixel capture", (s: any) => s.files["browser-board-0.png"] = png(1, 1), "capture size"],
  ["a visible layout mismatch labelled matched", (s: any) => s.files["browser-board-0.png"] = png(8, 6, () => [255, 0, 0, 255]), "visual mismatch"],
  ["a failed human visual check labelled matched", (s: any) => s.report[0].visualReview.layout = "differs", "visualReview.layout"],
  ["stale browser evidence", (s: any) => s.report[0].revision = "build-old", "revision"],
  ["an edited design baseline", (s: any) => s.files["design-0.png"] = png(8, 6, () => [255, 0, 0, 255]), "design hash"],
  ["one screenshot reused for different boards", (s: any) => s.report[1].browserScreenshot = s.report[0].browserScreenshot, "reused"],
  ["an incorrect route", (s: any) => s.report[0].route = "/other", "route"],
  ["a non-image screenshot", (s: any) => s.files["browser-board-0.png"] = "not a PNG", "PNG"],
  ["a missing design export", (s: any) => s.handoff.artboards[0].designExport = "missing.json", "designExport"],
  ["an unknown focused board", (_s: any) => {}, "Unknown focused board"],
])("rejects %s", async (_name, change, error) => {
  const r = await scenario(change as (s: any) => void, "coverage", error === "Unknown focused board" ? "not-a-board" : undefined);
  expect(r.code).toBe(1);
  expect(r.output).toContain(error as string);
});
