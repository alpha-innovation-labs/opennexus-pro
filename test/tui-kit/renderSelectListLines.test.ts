import assert from "node:assert/strict";
import test from "node:test";
import stripAnsi from "strip-ansi";
import { renderSelectListLines } from "../../packages/tui-kit/src/modal/select/renderSelectListLines.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("wrapped preserved rows do not insert empty padding lines and align muted ages", () => {
  const colors: string[] = [];
  const theme = {
    ...createTestTheme(),
    fg(color: string, value: string): string {
      colors.push(color);
      return value;
    },
  };
  const lines = renderSelectListLines({
    itemMaxLines: () => 2,
    items: [
      {
        value: "short",
        label: "Short title\n󰀄 1 · 󰍉 0 · 󰧑 0",
        description: "",
        preserveLabelWhitespace: true,
        resumeAge: "48m",
        wrapPreservedLabel: true,
      } as never,
      {
        value: "long",
        label: "This is a long history title that wraps past the pane width\n󰀄 2 · 󰍉 1 · 󰧑 1",
        description: "",
        preserveLabelWhitespace: true,
        resumeAge: "2h",
        wrapPreservedLabel: true,
      } as never,
    ],
    maxVisible: 10,
    selectedIndex: 0,
    theme: theme as never,
    width: 34,
  }).map((line) => stripAnsi(line));

  assert.equal(lines.length, 4);
  assert.match(lines[0]!, /Short title/u);
  assert.match(lines[1]!, /󰀄 1.*\s{2,}48m/u);
  assert.match(lines[2]!, /This is a long history title/u);
  assert.match(lines[3]!, /󰀄 2.*\s{2,}2h/u);
  assert.equal(lines.some((line) => line.trim() === ""), false);
  assert.equal(colors.includes("muted"), true);
});
