// Measures the visible controls and table cells on the current page and
// reports layout rules a screenshot comparison misses. Read-only: it changes
// nothing on the page. Run it in the browser with
//   agent-browser eval "$(bun scripts/layout-audit.ts --snippet)"
// and it returns { checked, issues } as JSON.

export type Box = {
  label: string;
  kind: "control" | "icon" | "cell";
  x: number;
  y: number;
  width: number;
  height: number;
  align?: string;
};

export function collect(): { boxes: Box[]; viewport: number } {
  const visible = (el: Element) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none"
    );
  };
  const box = (el: Element, kind: Box["kind"], label: string): Box => {
    const r = el.getBoundingClientRect();
    return {
      label: label.trim().replace(/\s+/g, " ").slice(0, 40),
      kind,
      x: r.left + scrollX,
      y: r.top + scrollY,
      width: Math.round(r.width),
      height: Math.round(r.height),
      align: kind === "cell" ? getComputedStyle(el).textAlign : undefined,
    };
  };
  const controls = document.querySelectorAll(
    'button, a[role="button"], [role="button"], [role="combobox"], select, ' +
      'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
  );
  const boxes: Box[] = [];
  for (const el of controls) {
    if (!visible(el) || el.closest('[aria-hidden="true"]')) continue;
    const text = (el as HTMLElement).innerText?.trim() ?? "";
    const named =
      text ||
      el.getAttribute("aria-label") ||
      (el as HTMLInputElement).placeholder ||
      el.getAttribute("name") ||
      el.tagName.toLowerCase();
    const iconOnly = !text && Boolean(el.querySelector("svg, img"));
    boxes.push(box(el, iconOnly ? "icon" : "control", named));
  }
  for (const el of document.querySelectorAll('td, [role="cell"]')) {
    if (visible(el)) boxes.push(box(el, "cell", (el as HTMLElement).innerText));
  }
  return { boxes, viewport: innerWidth };
}

export function audit(
  page: { boxes: Box[]; viewport: number },
  options = { phoneBelow: 768, minTarget: 44, minGap: 8, rowGap: 24 },
): { checked: number; issues: string[] } {
  const issues: string[] = [];
  const targets = page.boxes.filter((b) => b.kind !== "cell");
  const phone = page.viewport < options.phoneBelow;
  const overlapsVertically = (a: Box, b: Box) =>
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 0;
  const gapBetween = (a: Box, b: Box) =>
    Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width);

  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      const [a, b] = [targets[i], targets[j]];
      const gap = gapBetween(a, b);
      if (!overlapsVertically(a, b) || gap < 0 || gap > options.rowGap) {
        continue;
      }
      const pair = `"${a.label}" and "${b.label}"`;
      if (Math.abs(a.height - b.height) > 1) {
        issues.push(
          `${pair} sit side by side at ${a.height}px and ${b.height}px high; controls in a row share one height`,
        );
      } else if (Math.abs(a.y + a.height / 2 - (b.y + b.height / 2)) > 2) {
        issues.push(`${pair} sit side by side off one centre line`);
      }
      if (phone && gap < options.minGap) {
        issues.push(`${pair} are ${Math.round(gap)}px apart; keep ${options.minGap}px between targets`);
      }
    }
  }
  for (const b of targets) {
    if (b.kind === "icon" && Math.abs(b.width - b.height) > 1) {
      issues.push(`Icon button "${b.label}" is ${b.width}×${b.height}; make it square`);
    }
    if (phone && Math.min(b.width, b.height) < options.minTarget) {
      issues.push(
        `"${b.label}" is ${b.width}×${b.height} on a phone; targets are at least ${options.minTarget}px`,
      );
    }
  }
  const number = /^[-+]?[₹$€£]?\s?[\d.,]+\s?%?$/;
  for (const cell of page.boxes.filter((b) => b.kind === "cell")) {
    if (number.test(cell.label) && !["right", "end"].includes(cell.align ?? "")) {
      issues.push(`Number "${cell.label}" is ${cell.align}-aligned; align numbers right`);
    }
  }
  return { checked: page.boxes.length, issues };
}

if (import.meta.main) {
  if (Bun.argv[2] !== "--snippet") {
    console.error('Usage: agent-browser eval "$(bun layout-audit.ts --snippet)"');
    process.exitCode = 1;
  } else {
    console.log(`(${audit.toString()})((${collect.toString()})())`);
  }
}
