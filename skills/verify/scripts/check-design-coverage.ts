import { stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArtboard(value: unknown): value is { name: string; device: string } {
  return isRecord(value) && nonEmpty(value.name) && nonEmpty(value.device);
}

async function readApproved(inventoryPath: string) {
  const inventory: unknown = await Bun.file(inventoryPath).json();
  if (!isRecord(inventory)) {
    throw new Error(
      "Approved inventory must declare requiredDevices and artboards",
    );
  }
  const { requiredDevices, artboards } = inventory;
  if (
    !Array.isArray(requiredDevices) ||
    !requiredDevices.length ||
    !requiredDevices.every(nonEmpty)
  ) {
    throw new Error("Approved inventory must list its required devices");
  }
  if (
    !Array.isArray(artboards) ||
    !artboards.length ||
    !artboards.every(isArtboard)
  ) {
    throw new Error("Approved inventory must list artboard names and devices");
  }
  const approved = new Set(artboards.map(({ name }) => name));
  if (approved.size !== artboards.length) {
    throw new Error("Approved artboard names must be unique");
  }
  const coveredDevices = new Set(artboards.map(({ device }) => device));
  const missingDevices = requiredDevices.filter(
    (device) => !coveredDevices.has(device),
  );
  if (missingDevices.length) {
    throw new Error(
      missingDevices
        .map(
          (device) => `Missing approved artboard for required device ${device}`,
        )
        .join("\n"),
    );
  }
  return approved;
}

async function checkCoverage(approved: Set<string>, reportPath: string) {
  const report: unknown = await Bun.file(reportPath).json();
  if (!Array.isArray(report))
    throw new Error("Coverage report must be an array");
  const directory = dirname(resolve(reportPath));
  const seen = new Set<string>();
  const issues: string[] = [];

  for (const row of report) {
    if (!isRecord(row) || !nonEmpty(row.artboard)) {
      issues.push("Each coverage row must name an artboard");
      continue;
    }
    const { artboard, status, designReference, browserScreenshot } = row;
    if (!approved.has(artboard)) {
      issues.push(`Unexpected artboard ${artboard}`);
      continue;
    }
    if (seen.has(artboard)) {
      issues.push(`Duplicate result for ${artboard}`);
      continue;
    }
    seen.add(artboard);

    if (status === "blocked" || status === "differs") {
      issues.push(`${artboard}: ${status}`);
    } else if (status !== "matched") {
      issues.push(`${artboard}: expected matched, differs, or blocked`);
    } else {
      if (!nonEmpty(designReference))
        issues.push(`${artboard}: missing design reference`);
      const screenshot = nonEmpty(browserScreenshot)
        ? await stat(resolve(directory, browserScreenshot)).catch(
            () => undefined,
          )
        : undefined;
      if (!screenshot?.isFile() || screenshot.size === 0) {
        issues.push(`${artboard}: browser screenshot is missing or empty`);
      }
    }
  }
  for (const artboard of approved) {
    if (!seen.has(artboard)) issues.push(`Missing result for ${artboard}`);
  }

  if (issues.length) throw new Error(issues.join("\n"));
  console.log(
    `${approved.size}/${approved.size} approved artboards matched with evidence`,
  );
}

try {
  const [inventory, report] = Bun.argv.slice(2);
  if (!inventory || !report || Bun.argv.length !== 4) {
    throw new Error(
      "Usage: bun check-design-coverage.ts <approved.json> <coverage.json|--inventory-only>",
    );
  }
  const approved = await readApproved(inventory);
  if (report === "--inventory-only") {
    console.log(`Approved inventory valid for ${approved.size} artboards`);
  } else {
    await checkCoverage(approved, report);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
