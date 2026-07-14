import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import stripAnsi from "strip-ansi";
import { padModalLine } from "../../packages/tui-kit/src/modal/padModalLine.js";
import { padMarkdownPreviewLine } from "../../packages/tui-kit/src/markdown-preview/padMarkdownPreviewLine.js";

const redBg = "\x1b[48;2;15;18;22m\x1b[38;2;240;113;120m linear \x1b[0m";

test("modal padding treats ANSI escape sequences as zero width", () => {
  const line = padModalLine(`The ${redBg} command`, 20);
  assert.equal(visibleWidth(stripAnsi(line)), 20);
  assert.match(stripAnsi(line), /^The  linear  command/u);
});

test("markdown padding treats ANSI escape sequences as zero width", () => {
  const line = padMarkdownPreviewLine(`The ${redBg} command`, 20);
  assert.equal(visibleWidth(stripAnsi(line)), 20);
  assert.match(stripAnsi(line), /^The  linear  command/u);
});
