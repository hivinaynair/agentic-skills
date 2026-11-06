import { stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function checkCoverage(inventoryPath: string, reportPath: string) {
  const inventory: unknown = await Bun.file(inventoryPath).json();
  if (
    !Array.isArray(inventory) ||
    !inventory.length ||
    !inventory.every(nonEmpty)
  ) {
    throw new Error(
      "Approved inventory must be a nonempty array of artboard names",
    );
  }
  const approved = new Set(inventory);
  if (approved.size !== inventory.length) {
    throw new Error("Approved artboard names must be unique");
  }

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
    const { artboard, status, paperReference, browserScreenshot } = row;
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
      if (!nonEmpty(paperReference))
        issues.push(`${artboard}: missing Paper reference`);
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
  if (Bun.argv.length !== 4 || !inventory || !report) {
    throw new Error(
      "Usage: bun check-paper-coverage.ts <approved.json> <coverage.json>",
    );
  }
  await checkCoverage(inventory, report);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
