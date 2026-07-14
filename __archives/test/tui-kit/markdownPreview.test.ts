import assert from "node:assert/strict";
import test from "node:test";
import stripAnsi from "strip-ansi";
import { renderMarkdownPreview } from "../../packages/tui-kit/src/markdown-preview/renderMarkdownPreview.js";
import type { MarkdownPreviewStyleToken, MarkdownPreviewTheme } from "../../packages/tui-kit/src/markdown-preview/types.js";

test("renders ratkit-style heading bars, inline emphasis, lists, quotes, rules, and code", () => {
  const styledTokens: MarkdownPreviewStyleToken[] = [];
  const theme: MarkdownPreviewTheme = {
    style(token, value) {
      styledTokens.push(token);
      return value;
    },
  };

  const lines = renderMarkdownPreview({
    markdown: [
      "# Title",
      "This has **bold**, *italic*, `code`, and [docs](https://example.com).",
      "- [x] Done",
      "> quoted",
      "---",
      "```ts",
      "const ok = true;",
      "```",
    ].join("\n"),
    theme,
    width: 32,
  });

  assert.match(stripAnsi(lines[0]!), /^ 1 │  ① Title/u);
  assert.match(stripAnsi(lines[1]!), /^ 2 │ This has bold/u);
  assert.match(lines.map(stripAnsi).find((line) => line.includes("● 󰱒 Done")) ?? "", /^\s*\d+ │  ● 󰱒 Done/u);
  assert.match(stripAnsi(lines.find((line) => line.includes("▋ quoted")) ?? ""), /^\s*\d+ │ ▋ quoted/u);
  assert.match(stripAnsi(lines.find((line) => line.includes("──")) ?? ""), /^\s*\d+ │ ─+/u);
  assert.match(stripAnsi(lines.find((line) => line.includes("╭─   ts")) ?? ""), /^\s*\d+ │ ╭─   ts/u);
  assert.match(stripAnsi(lines.find((line) => line.includes("│ const ok = true;")) ?? ""), /^\s*\d+ │ │ const ok = true;/u);
  assert.match(stripAnsi(lines.at(-1) ?? ""), /^\s*\d+ │ ╰─+╯/u);
  assert.match(lines[0]!, /\x1b\[48;2;80;40;80m/u);
  assert.equal(styledTokens.includes("heading.h1.background"), true);
  assert.equal(styledTokens.includes("strong"), true);
  assert.equal(styledTokens.includes("emphasis"), true);
  assert.equal(styledTokens.includes("inlineCode"), true);
  assert.equal(styledTokens.includes("link"), true);
});

test("colors line numbers and inline code with fixed ANSI preview colors", () => {
  const lines = renderMarkdownPreview({ markdown: "The `linear` command", width: 40 });

  assert.match(lines[0]!, /\x1b\[38;2;75;86;112m\s*1\x1b\[0m/u);
  assert.match(lines[0]!, /\x1b\[48;2;15;18;22m\x1b\[38;2;240;113;120m linear \x1b\[0m/u);
  assert.doesNotMatch(lines[0]!, /󰲡||/u);
});

test("cycles nested unordered list markers and colors bullets orange", () => {
  const lines = renderMarkdownPreview({
    markdown: ["- root", "  - child", "    - grandchild", "1. ordered"].join("\n"),
    width: 40,
  });

  assert.deepEqual(lines.map(stripAnsi), [" 1 │  ● root                            ", " 2 │    ○ child                         ", " 3 │      ◆ grandchild                  ", " 4 │  1. ordered                        "]);
  assert.match(lines[0]!, /\x1b\[38;2;255;180;84m● /u);
});

test("wraps markdown preview lines within the numbered gutter width", () => {
  const lines = renderMarkdownPreview({
    markdown: "This is a very long markdown paragraph that should wrap cleanly.",
    width: 24,
  });

  assert.deepEqual(lines.map(stripAnsi), [" 1 │ This is a very long", "   │ markdown paragraph ", "   │ that should wrap   ", "   │ cleanly.           "]);
});
