import { stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { comparePng, decodePng, pngSize, type Region } from "./png-diff";

type Board = Record<string, unknown> & { name: string; device: string };
type Handoff = {
  boards: Map<string, Board>;
  exceptions: Map<string, { boards: Set<string>; regions: Region[] }>;
  reconciled?: boolean;
};

const componentUses = new Set(["reuse", "restyle", "new"]);
const fields = {
  handoff: new Set([
    "feature",
    "page",
    "designSource",
    "status",
    "gaps",
    "requiredDevices",
    "viewports",
    "clock",
    "components",
    "exceptions",
    "artboards",
    "deviceExclusions",
  ]),
  artboard: new Set([
    "name",
    "device",
    "route",
    "setup",
    "criteria",
    "notes",
    "loadingFor",
    "id", "screen", "state", "designScreenshot", "designHash", "designExport", "captureSize",
  ]),
  component: new Set(["design", "code", "use"]),
  exception: new Set(["id", "artboards", "detail", "regions"]),
};

function checkFields(
  record: Record<string, unknown>,
  kind: keyof typeof fields,
  label: string,
  issues: string[],
) {
  for (const key of Object.keys(record)) {
    if (!fields[kind].has(key)) {
      issues.push(`${label}: unknown ${kind} field ${key}`);
    }
  }
}

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
  const boards = new Map<string, Board>();
  for (const board of artboards) {
    if (!isRecord(board) || !nonEmpty(board.name) || !nonEmpty(board.device)) {
      throw new Error("Handoff must list artboards with names and devices");
    }
    if (boards.has(board.name)) {
      throw new Error("Approved artboard names must be unique");
    }
    boards.set(board.name, board as Board);
  }
  for (const [name, board] of boards) {
    checkFields(board, "artboard", name, issues);
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
      continue;
    }
    checkFields(entry, "component", entry.design, issues);
    if (!componentUses.has(String(entry.use))) {
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
  const approved = new Map<string, { boards: Set<string>; regions: Region[] }>();
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
    checkFields(entry, "exception", entry.id, issues);
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
    const regions = entry.regions ?? [];
    if (!Array.isArray(regions) || !regions.every(r => isRecord(r) &&
        [r.x, r.y, r.width, r.height].every(Number.isInteger))) {
      issues.push(`${entry.id}: regions must contain integer x, y, width and height`);
      continue;
    }
    approved.set(entry.id, { boards: new Set(entry.artboards), regions: regions as Region[] });
  }
  return approved;
}

function matrix(boards: Board[], devices: string[], exclusions: unknown, issues: string[], requiredStates: unknown = []) {
  const omitted = new Set<string>();
  if (exclusions !== undefined && !Array.isArray(exclusions)) issues.push("deviceExclusions must be a list");
  for (const e of Array.isArray(exclusions) ? exclusions : []) {
    if (!isRecord(e) || ![e.screen, e.state, e.device, e.reason].every(nonEmpty))
      issues.push("Device exclusions need screen, state, device and an approved reason");
    else omitted.add(JSON.stringify([e.screen, e.state, e.device]));
  }
  const states = new Map<string, Board>();
  const pairs = new Map<string, { screen: string; state: string }>();
  if (!Array.isArray(requiredStates)) issues.push("requiredStates must list screen/state pairs from the agreed journeys");
  for (const pair of Array.isArray(requiredStates) ? requiredStates : []) {
    if (!isRecord(pair) || !nonEmpty(pair.screen) || !nonEmpty(pair.state)) issues.push("requiredStates needs screen and state");
    else pairs.set(JSON.stringify([pair.screen, pair.state]), { screen: pair.screen, state: pair.state });
  }
  for (const b of boards) {
    if (!nonEmpty(b.screen) || !nonEmpty(b.state)) continue;
    const key = JSON.stringify([b.screen, b.state, b.device]);
    if (states.has(key)) issues.push(`Duplicate state ${b.screen} / ${b.state} / ${b.device}`);
    if (omitted.has(key)) issues.push(`Device exclusion also has a board: ${b.name}`);
    states.set(key, b);
    pairs.set(JSON.stringify([b.screen, b.state]), { screen: String(b.screen), state: String(b.state) });
  }
  for (const b of pairs.values()) for (const device of devices) {
    const key = JSON.stringify([b.screen, b.state, device]);
    if (!states.has(key) && !omitted.has(key)) issues.push(`Missing ${b.screen} / ${b.state} / ${device}`);
  }
}

async function readHandoff(handoffPath: string, ready: boolean, deviceExclusions?: unknown, validatePng = false): Promise<Handoff> {
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
  checkFields(handoff, "handoff", "Handoff", issues);
  const { status, gaps } = handoff;
  if (ready && (status !== "ready" || (Array.isArray(gaps) && gaps.length)))
    issues.push("Handoff is not ready; draft or missing status cannot establish completion");
  if (status !== undefined && status !== "ready" && status !== "draft") {
    issues.push("status must be ready or draft");
  }
  if (gaps !== undefined && !stringList(gaps)) {
    issues.push("gaps must be a list of sentences");
  } else if (status === "ready" && gaps?.length) {
    issues.push("A ready handoff cannot list gaps; mark it draft");
  } else if (status !== "draft" && gaps?.length) {
    issues.push("A handoff with gaps must be marked draft");
  }
  const boards = checkBoards(handoff.artboards, issues);
  const ids = new Set<string>();
  for (const board of boards.values()) {
    if (ready && ![board.id, board.screen, board.state].every(nonEmpty))
      issues.push(`${board.name}: needs stable id, screen and state; refresh the handoff`);
    if (nonEmpty(board.id)) {
      if (ids.has(board.id)) issues.push(`Duplicate board ID ${board.id}`);
      ids.add(board.id);
    }
  }
  matrix([...boards.values()], requiredDevices, deviceExclusions ?? handoff.deviceExclusions, issues);

  const coveredDevices = new Set(
    [...boards.values()].map(({ device }) => device),
  );
  for (const device of requiredDevices) {
    const exclusions = deviceExclusions ?? handoff.deviceExclusions;
    const allExcluded = [...boards.values()].every(b => nonEmpty(b.screen) && nonEmpty(b.state) &&
      Array.isArray(exclusions) && exclusions.some(e => isRecord(e) && e.screen === b.screen && e.state === b.state && e.device === device && nonEmpty(e.reason)));
    if (!coveredDevices.has(device) && !allExcluded) {
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
  for (const board of boards.values()) {
    board.viewport = isRecord(viewports) ? viewports[board.device] : undefined;
    board.viewport ??= board.device === "Phone" ? "390x844" : "1440x900";
    if (ready) try {
      if (!nonEmpty(board.designScreenshot) || !nonEmpty(board.designExport))
        throw Error("needs saved designScreenshot and designExport");
      const bytes = await Bun.file(resolve(dirname(handoffPath), board.designScreenshot)).bytes();
      if (board.designHash !== new Bun.CryptoHasher("sha256").update(bytes).digest("hex"))
        throw Error("design hash differs from the pinned baseline");
      const image = pngSize(bytes);
      if (validatePng) decodePng(bytes);
      const size = board.captureSize ?? board.viewport;
      if (size !== `${image.width}x${image.height}`) throw Error("design capture size differs from captureSize/viewport");
      const [width, height] = String(board.viewport).split("x").map(Number);
      if (image.width !== width || image.height < height) throw Error("design capture size must cover its viewport");
      if (!(await hasScreenshot(dirname(handoffPath), board.designExport))) throw Error("designExport is missing or empty");
      board.referencePath = resolve(dirname(handoffPath), board.designScreenshot);
    } catch (error) { issues.push(`${board.name}: ${error instanceof Error ? error.message : error}`); }
  }
  if (issues.length) throw new Error(issues.join("\n"));
  return { boards, exceptions };
}

async function readScope(path: string, ready: boolean, validatePng = false): Promise<Handoff> {
  const scope = await Bun.file(path).json();
  if (!isRecord(scope) || scope.handoffs === undefined) return readHandoff(path, ready, undefined, validatePng);
  if (!stringList(scope.handoffs) || !scope.handoffs.length || !nonEmpty(scope.inventory) ||
      !stringList(scope.requiredDevices) || !scope.requiredDevices.length)
    throw Error("Scope needs handoffs, a source inventory file and requiredDevices");
  const root = dirname(path), inventory = await Bun.file(resolve(root, scope.inventory)).json();
  if (!isRecord(inventory) || !Array.isArray(inventory.artboards) || !inventory.artboards.length)
    throw Error("Source inventory must list artboards");
  if (!Array.isArray(inventory.requiredStates) || !inventory.requiredStates.length)
    throw Error("Source inventory needs requiredStates from the agreed journeys");
  const issues: string[] = [], expected = new Map<string, Board>(), excluded = new Set<string>();
  if (inventory.excluded !== undefined && !Array.isArray(inventory.excluded)) throw Error("Inventory excluded must be a list");
  for (const e of inventory.excluded ?? []) {
    if (!isRecord(e) || !nonEmpty(e.id) || !nonEmpty(e.reason)) issues.push("Inventory exclusions need id and approved reason");
    else { if (excluded.has(e.id)) issues.push(`Duplicate exclusion ${e.id}`); excluded.add(e.id); }
  }
  for (const b of inventory.artboards) {
    if (!isRecord(b) || ![b.id, b.screen, b.state, b.device].every(nonEmpty)) {
      issues.push("Inventory boards need id, screen, state and device"); continue;
    }
    if (expected.has(b.id as string)) issues.push(`Duplicate source board ${b.id}`);
    expected.set(b.id as string, b as Board);
  }
  for (const id of excluded) if (!expected.has(id)) issues.push(`Excluded board ${id} is not in source inventory`);
  const result: Handoff = { boards: new Map(), exceptions: new Map(), reconciled: true };
  const ids = new Set<string>();
  for (const file of scope.handoffs) {
    const page = await readHandoff(resolve(root, file), ready, inventory.deviceExclusions, validatePng);
    for (const [name, board] of page.boards) {
      const id = String(board.id), original = expected.get(id);
      if (!original || excluded.has(id)) issues.push(`Unexpected handoff board ${id}`);
      else if (["screen", "state", "device"].some(k => board[k] !== original[k])) issues.push(`Source identity differs for ${id}`);
      if (ids.has(id) || result.boards.has(name)) issues.push(`Board handed off twice: ${id}`);
      ids.add(id); result.boards.set(name, board);
    }
    for (const [id, exception] of page.exceptions) {
      if (result.exceptions.has(id)) issues.push(`Exception IDs must be unique across scope: ${id}`);
      result.exceptions.set(id, exception);
    }
  }
  for (const id of expected.keys()) if (!excluded.has(id) && !ids.has(id)) issues.push(`Missing handoff for approved board ${id}`);
  matrix([...expected].filter(([id]) => !excluded.has(id)).map(([, b]) => b), scope.requiredDevices, inventory.deviceExclusions, issues, inventory.requiredStates);
  matrix([...result.boards.values()], scope.requiredDevices, inventory.deviceExclusions, issues, inventory.requiredStates);
  if (!result.boards.size) issues.push("Scope has no included boards");
  if (issues.length) throw Error(issues.join("\n"));
  return result;
}

async function hasScreenshot(directory: string, path: unknown) {
  if (!nonEmpty(path)) return false;
  const file = await stat(resolve(directory, path)).catch(() => undefined);
  return Boolean(file?.isFile() && file.size > 0);
}

async function checkCoverage(handoff: Handoff, reportPath: string, revision: string, focus?: string[]) {
  const report: unknown = await Bun.file(reportPath).json();
  if (!Array.isArray(report))
    throw new Error("Coverage report must be an array");
  const directory = dirname(resolve(reportPath));
  const seen = new Set<string>();
  const issues: string[] = [];
  const screenshots = new Set<string>();
  const expected = new Map([...handoff.boards].filter(([, b]) => !focus || focus.includes(String(b.id))));
  if (focus) for (const id of focus) if (![...expected.values()].some(b => b.id === id)) issues.push(`Unknown focused board ${id}`);

  for (const row of report) {
    if (!isRecord(row) || !nonEmpty(row.artboard)) {
      issues.push("Each coverage row must name an artboard");
      continue;
    }
    const { artboard, status } = row;
    const board = expected.get(artboard);
    if (!board) {
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
      if (!allowed?.boards.has(artboard)) {
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
    if (row.boardId !== board.id) issues.push(`${artboard}: boardId differs from the pinned design`);
    if (row.revision !== revision) issues.push(`${artboard}: evidence revision differs from tested code`);
    if (row.route !== board.route) issues.push(`${artboard}: evidence route differs`);
    if (row.viewport !== board.viewport) issues.push(`${artboard}: evidence viewport differs`);
    for (const key of ["layout", "typography", "spacing", "controls", "content"]) {
      if (!isRecord(row.visualReview) || row.visualReview[key] !== "pass") issues.push(`${artboard}: visualReview.${key} must pass outside approved exception regions`);
    }
    if (!(await hasScreenshot(directory, row.browserScreenshot))) {
      issues.push(`${artboard}: browser screenshot is missing or empty`);
    } else if (nonEmpty(row.browserScreenshot)) {
      const path = resolve(directory, row.browserScreenshot);
      if (screenshots.has(path)) issues.push(`${artboard}: screenshot reused for different boards`);
      screenshots.add(path);
      try {
        const actual = decodePng(await Bun.file(path).bytes());
        const regions = status === "deviation" ? handoff.exceptions.get(String(row.exception))?.regions ?? [] : [];
        const reference = decodePng(await Bun.file(String(board.referencePath)).bytes());
        const diff = comparePng(reference, actual, regions);
        if (!diff.passed) issues.push(`${artboard}: visual mismatch (${(diff.ratio * 100).toFixed(2)}% overall, ${(diff.worstTile * 100).toFixed(2)}% worst tile outside exceptions)`);
      } catch (error) { issues.push(`${artboard}: ${error instanceof Error ? error.message : error}`); }
    }
  }
  for (const artboard of expected.keys()) {
    if (!seen.has(artboard)) issues.push(`Missing result for ${artboard}`);
  }

  if (issues.length) throw new Error(issues.join("\n"));
  const total = expected.size;
  console.log(`${focus ? "Focused " : ""}${total}/${handoff.boards.size} board evidence records complete; pixel comparison passed; ${focus ? "partial scope" : handoff.reconciled ? "source inventory reconciled" : "page only, source inventory not reconciled"}. Pixel checks do not prove behavior or usability.`);
}

try {
  const [handoffPath, report, ...args] = Bun.argv.slice(2);
  const options = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    if (!["--revision", "--focus"].includes(args[i]) || !nonEmpty(args[i + 1]) || options.has(args[i])) throw Error("Expected --revision <fingerprint> or --focus <board-id,board-id>");
    options.set(args[i], args[i + 1]);
  }
  const revision = options.get("--revision"), focus = options.get("--focus")?.split(",");
  if (!handoffPath || !report || focus?.some(id => !id.trim())) {
    throw new Error(
      "Usage: bun check-design-coverage.ts <handoff.json|scope.json> <--inventory-only|--ready|coverage.json> [--revision <tested-code-fingerprint>] [--focus <board-id,board-id>]",
    );
  }
  if (report !== "--inventory-only" && report !== "--ready" && !nonEmpty(revision)) throw Error("Coverage needs --revision <tested-code-fingerprint>");
  if (focus && report.startsWith("--")) throw Error("--focus applies only to partial coverage reports");
  const handoff = await readScope(resolve(handoffPath), report !== "--inventory-only", report === "--ready");
  if (report === "--inventory-only") {
    console.log(`Handoff valid for ${handoff.boards.size} artboards (structure only; not build readiness)`);
  } else if (report === "--ready") {
    console.log(`${handoff.boards.size} board references ready${handoff.reconciled ? "; source inventory reconciled" : "; page only"}. Running code was not checked.`);
  } else {
    await checkCoverage(handoff, report, revision!, focus);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
