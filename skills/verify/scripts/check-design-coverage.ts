import { stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type Handoff = {
  boards: Set<string>;
  exceptions: Map<string, Set<string>>;
};

const componentUses = new Set(["reuse", "restyle", "new"]);

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(nonEmpty);
}

function checkBoards(artboards: unknown, issues: string[]) {
  if (!Array.isArray(artboards) || !artboards.length) {
    throw new Error("Handoff must list artboards with names and devices");
  }
  const boards = new Map<string, Record<string, unknown>>();
  for (const board of artboards) {
    if (!isRecord(board) || !nonEmpty(board.name) || !nonEmpty(board.device)) {
      throw new Error("Handoff must list artboards with names and devices");
    }
    if (boards.has(board.name)) {
      throw new Error("Approved artboard names must be unique");
    }
    boards.set(board.name, board);
  }
  for (const [name, board] of boards) {
    if (!nonEmpty(board.route)) issues.push(`${name}: missing route`);
    if (!nonEmpty(board.setup)) issues.push(`${name}: missing setup`);
    if (board.criteria !== undefined && !stringList(board.criteria)) {
      issues.push(`${name}: criteria must be a list of IDs`);
    }
    if (board.notes !== undefined && !stringList(board.notes)) {
      issues.push(`${name}: notes must be a list of sentences`);
    }
    if (board.loadingFor !== undefined) {
      const loaded = boards.get(String(board.loadingFor));
      if (!loaded) {
        issues.push(
          `${name}: loadingFor names unknown board ${board.loadingFor}`,
        );
      } else if (loaded.device !== board.device) {
        issues.push(`${name}: loadingFor must pair boards on one device`);
      }
    }
  }
  return boards;
}

function checkComponents(components: unknown, issues: string[]) {
  if (components === undefined) return;
  if (!Array.isArray(components)) {
    issues.push("components must be a list");
    return;
  }
  for (const entry of components) {
    if (!isRecord(entry) || !nonEmpty(entry.design)) {
      issues.push("Each component must name its design component");
    } else if (!componentUses.has(String(entry.use))) {
      issues.push(`${entry.design}: use must be reuse, restyle or new`);
    } else if (entry.use !== "new" && !nonEmpty(entry.code)) {
      issues.push(`${entry.design}: ${entry.use} needs the code it maps to`);
    }
  }
}

function checkExceptions(
  exceptions: unknown,
  boards: Map<string, unknown>,
  issues: string[],
) {
  const approved = new Map<string, Set<string>>();
  if (exceptions === undefined) return approved;
  if (!Array.isArray(exceptions)) {
    issues.push("exceptions must be a list");
    return approved;
  }
  for (const entry of exceptions) {
    if (!isRecord(entry) || !nonEmpty(entry.id) || !nonEmpty(entry.detail)) {
      issues.push("Each exception needs an id and detail");
      continue;
    }
    if (approved.has(entry.id)) {
      issues.push(`Duplicate exception ${entry.id}`);
      continue;
    }
    if (!stringList(entry.artboards) || !entry.artboards.length) {
      issues.push(`${entry.id}: list the artboards it applies to`);
      continue;
    }
    for (const name of entry.artboards) {
      if (!boards.has(name)) issues.push(`${entry.id}: unknown artboard ${name}`);
    }
    approved.set(entry.id, new Set(entry.artboards));
  }
  return approved;
}

async function readHandoff(handoffPath: string): Promise<Handoff> {
  const handoff: unknown = await Bun.file(handoffPath).json();
  if (!isRecord(handoff)) {
    throw new Error("Handoff must declare requiredDevices and artboards");
  }
  const { requiredDevices, viewports, clock } = handoff;
  if (
    !Array.isArray(requiredDevices) ||
    !requiredDevices.length ||
    !requiredDevices.every(nonEmpty)
  ) {
    throw new Error("Handoff must list its required devices");
  }
  const issues: string[] = [];
  const boards = checkBoards(handoff.artboards, issues);

  const coveredDevices = new Set(
    [...boards.values()].map(({ device }) => device),
  );
  for (const device of requiredDevices) {
    if (!coveredDevices.has(device)) {
      issues.push(`Missing approved artboard for required device ${device}`);
    }
  }
  if (viewports !== undefined) {
    if (!isRecord(viewports)) {
      issues.push("viewports must map devices to sizes");
    } else {
      for (const [device, size] of Object.entries(viewports)) {
        if (!(typeof size === "string" && /^\d+x\d+$/.test(size))) {
          issues.push(`${device}: viewport must look like 1440x900`);
        }
      }
    }
  }
  if (
    clock !== undefined &&
    !(nonEmpty(clock) && !Number.isNaN(Date.parse(clock)))
  ) {
    issues.push("clock must be an ISO date and time");
  }
  checkComponents(handoff.components, issues);
  const exceptions = checkExceptions(handoff.exceptions, boards, issues);
  if (issues.length) throw new Error(issues.join("\n"));
  return { boards: new Set(boards.keys()), exceptions };
}

async function hasScreenshot(directory: string, path: unknown) {
  if (!nonEmpty(path)) return false;
  const file = await stat(resolve(directory, path)).catch(() => undefined);
  return Boolean(file?.isFile() && file.size > 0);
}

async function checkCoverage(handoff: Handoff, reportPath: string) {
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
    const { artboard, status } = row;
    if (!handoff.boards.has(artboard)) {
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
      continue;
    }
    if (status === "deviation") {
      const allowed = handoff.exceptions.get(String(row.exception));
      if (!allowed?.has(artboard)) {
        issues.push(
          `${artboard}: deviation needs an exception that lists this board`,
        );
      }
      if (!nonEmpty(row.note)) issues.push(`${artboard}: deviation needs a note`);
    } else if (status !== "matched") {
      issues.push(
        `${artboard}: expected matched, deviation, differs, or blocked`,
      );
      continue;
    }
    if (!nonEmpty(row.designReference))
      issues.push(`${artboard}: missing design reference`);
    if (!(await hasScreenshot(directory, row.browserScreenshot))) {
      issues.push(`${artboard}: browser screenshot is missing or empty`);
    }
  }
  for (const artboard of handoff.boards) {
    if (!seen.has(artboard)) issues.push(`Missing result for ${artboard}`);
  }

  if (issues.length) throw new Error(issues.join("\n"));
  const total = handoff.boards.size;
  console.log(`${total}/${total} approved artboards matched with evidence`);
}

try {
  const [handoffPath, report] = Bun.argv.slice(2);
  if (!handoffPath || !report || Bun.argv.length !== 4) {
    throw new Error(
      "Usage: bun check-design-coverage.ts <handoff.json> <coverage.json|--inventory-only>",
    );
  }
  const handoff = await readHandoff(handoffPath);
  if (report === "--inventory-only") {
    console.log(`Handoff valid for ${handoff.boards.size} artboards`);
  } else {
    await checkCoverage(handoff, report);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
