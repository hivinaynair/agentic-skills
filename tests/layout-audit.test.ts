import { expect, test } from "bun:test";
import { join } from "node:path";
import { audit, type Box } from "../skills/verify/scripts/layout-audit.ts";

const control = (label: string, x: number, height = 40, y = 0): Box => ({
  label,
  kind: "control",
  x,
  y,
  width: 120,
  height,
});
const desktop = (boxes: Box[]) => audit({ boxes, viewport: 1440 }).issues;
const phone = (boxes: Box[]) => audit({ boxes, viewport: 390 }).issues;

test("passes matching controls in a row", () => {
  expect(desktop([control("Save", 0), control("Cancel", 136)])).toEqual([]);
});

test("flags controls side by side at different heights", () => {
  const issues = desktop([
    control("Start next booking", 0, 48),
    control("Open booking", 136, 40, 4),
  ]);
  expect(issues).toEqual([
    '"Start next booking" and "Open booking" sit side by side at 48px and 40px high; controls in a row share one height',
  ]);
});

test("ignores controls far apart or in different rows", () => {
  expect(desktop([control("A", 0, 48), control("B", 400, 40)])).toEqual([]);
  expect(desktop([control("A", 0, 48), control("B", 0, 40, 80)])).toEqual([]);
});

test("flags equal controls off one centre line", () => {
  expect(desktop([control("A", 0, 40), control("B", 136, 40, 6)])[0]).toContain(
    "off one centre line",
  );
});

test("flags a non-square icon button", () => {
  const icon: Box = { label: "Menu", kind: "icon", x: 0, y: 0, width: 40, height: 36 };
  expect(desktop([icon])).toEqual(['Icon button "Menu" is 40×36; make it square']);
});

test("flags small or crowded targets on a phone only", () => {
  const boxes = [control("Save", 0, 40), control("Cancel", 124, 40)];
  expect(desktop(boxes)).toEqual([]);
  expect(phone(boxes)).toEqual([
    '"Save" and "Cancel" are 4px apart; keep 8px between targets',
    '"Save" is 120×40 on a phone; targets are at least 44px',
    '"Cancel" is 120×40 on a phone; targets are at least 44px',
  ]);
});

test("flags numbers that are not right-aligned", () => {
  const cell = (label: string, align: string): Box => ({
    label,
    kind: "cell",
    x: 0,
    y: 0,
    width: 80,
    height: 40,
    align,
  });
  expect(
    desktop([cell("₹420", "left"), cell("₹1,200", "right"), cell("Asha", "left")]),
  ).toEqual(['Number "₹420" is left-aligned; align numbers right']);
});

test("prints a browser snippet that parses as plain JavaScript", () => {
  const script = join(import.meta.dir, "../skills/verify/scripts/layout-audit.ts");
  const result = Bun.spawnSync([process.execPath, script, "--snippet"]);
  const snippet = result.stdout.toString();
  expect(result.exitCode).toBe(0);
  expect(() => new Function(`return ${snippet}`)).not.toThrow();
  expect(snippet).not.toContain(": Box");
});
