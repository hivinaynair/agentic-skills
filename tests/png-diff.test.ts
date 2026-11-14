import { expect, test } from "bun:test";
import { comparePng, decodePng } from "../skills/verify/scripts/png-diff";
import { png } from "./png-fixture";

test.each([0, 1, 2, 3, 4])("compares pixels across PNG row filter %i", filter => {
  const reference = decodePng(png(20, 15));
  const actual = decodePng(png(20, 15, undefined, filter));
  expect(comparePng(reference, actual).ratio).toBe(0);
  expect([...actual.pixels.slice(-4)]).toEqual([171, 154, 100, 255]);
});

test("flags a missing small control even below the whole-page tolerance", () => {
  const reference = decodePng(png(400, 300, () => [255, 255, 255, 255]));
  const actual = decodePng(png(400, 300, (x, y) => x < 16 && y < 16 ? [0, 0, 0, 255] : [255, 255, 255, 255]));
  const result = comparePng(reference, actual);
  expect(result.ratio).toBeLessThan(0.01);
  expect(result.passed).toBe(false);
});

test("allows small channel differences without changing acceptance thresholds", () => {
  const reference = decodePng(png(40, 30, () => [100, 100, 100, 255]));
  const actual = decodePng(png(40, 30, () => [102, 99, 101, 255]));
  expect(comparePng(reference, actual).passed).toBe(true);
});

test("visual exceptions cannot hide differences outside their region", () => {
  const reference = decodePng(png(40, 30, () => [255, 255, 255, 255]));
  const actual = decodePng(png(40, 30, () => [255, 0, 0, 255]));
  expect(comparePng(reference, actual, [{ x: 0, y: 0, width: 20, height: 30 }]).passed).toBe(false);
  expect(() => comparePng(reference, actual, [{ x: 0, y: 0, width: 40, height: 30 }])).toThrow("entire capture");
  expect(() => comparePng(reference, actual, [{ x: 39, y: 0, width: 2, height: 1 }])).toThrow("fit inside");
});

test("rejects different capture dimensions instead of resizing", () => {
  expect(() => comparePng(decodePng(png(40, 30)), decodePng(png(20, 15)))).toThrow("capture size");
});
