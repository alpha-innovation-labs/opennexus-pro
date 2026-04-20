import assert from "node:assert/strict";
import test from "node:test";
import { renderCompactLine } from "../../../src/extensions/tron/shared/compact-line/renderCompactLine.js";

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
};

test("renderCompactLine keeps label, summary, and right-aligned options", () => {
  const line = renderCompactLine({
    width: 48,
    icon: "⠙",
    label: "Explore",
    main: "Scan random files",
    options: "⟳2≤6 · 3 tool uses",
    theme,
  });

  assert.match(line, /Explore/);
  assert.match(line, /Scan random files/);
  assert.match(line, /⟳2≤6 · 3 tool uses/);
});
