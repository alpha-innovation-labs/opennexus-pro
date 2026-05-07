import assert from "node:assert/strict";
import test from "node:test";
import { Key } from "@mariozechner/pi-tui";
import stripAnsi from "strip-ansi";
import { SharedModal } from "../../packages/tui-kit/src/modal/SharedModal.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

/**
 * Creates an overflowing shared modal for scroll regression tests.
 *
 * @returns Shared modal with deterministic numbered content rows.
 */
function createOverflowModal(): SharedModal {
  return new SharedModal({
    footerLines: ["Footer"],
    fullScreen: true,
    fullScreenRows: 12,
    headerLines: ["Header"],
    minWidth: 30,
    panes: [{ id: "body", size: 1, lines: Array.from({ length: 20 }, (_, index) => `Line ${index + 1}`) }],
    theme: createTestTheme(),
  });
}

/**
 * Renders a modal without ANSI color sequences.
 *
 * @param modal Modal to render.
 * @returns Plain rendered rows.
 */
function renderPlain(modal: SharedModal): string[] {
  return modal.render(30).map((line) => stripAnsi(line));
}

test("SharedModal keeps fixed header and footer rows visible when body content overflows height", () => {
  const modal = createOverflowModal();
  const lines = renderPlain(modal);

  assert.equal(lines.length, 12);
  assert.match(lines[1] ?? "", /Header/u);
  assert.match(lines.at(-2) ?? "", /Footer/u);
  assert.match(lines.at(-1) ?? "", /^└─+┘$/u);

  modal.handleInput("G");
  const scrolledLines = renderPlain(modal);

  assert.match(scrolledLines[1] ?? "", /Header/u);
  assert.match(scrolledLines.at(-2) ?? "", /Footer/u);
  assert.match(scrolledLines.at(-1) ?? "", /^└─+┘$/u);
});

test("SharedModal shows a right-side scrollbar when content overflows height", () => {
  const lines = renderPlain(createOverflowModal());

  assert.equal(lines.slice(1, -1).some((line) => line.includes("┃")), true);
});

test("SharedModal scrolls overflowing content with vim-style keys", () => {
  const modal = createOverflowModal();

  assert.match(renderPlain(modal).join("\n"), /Line 1/u);

  modal.handleInput("j");
  assert.doesNotMatch(renderPlain(modal).join("\n"), /Line 1/u);
  assert.match(renderPlain(modal).join("\n"), /Line 2/u);

  modal.handleInput("G");
  assert.match(renderPlain(modal).join("\n"), /Line 20/u);

  modal.handleInput("g");
  modal.handleInput("g");
  assert.match(renderPlain(modal).join("\n"), /Line 1/u);

  modal.handleInput(Key.ctrl("d"));
  assert.match(renderPlain(modal).join("\n"), /Line 3/u);

  modal.handleInput(Key.ctrl("u"));
  assert.match(renderPlain(modal).join("\n"), /Line 1/u);

  modal.handleInput("G");
  modal.handleInput("k");
  assert.doesNotMatch(renderPlain(modal).join("\n"), /Line 20/u);
});
