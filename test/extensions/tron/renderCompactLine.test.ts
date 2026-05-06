import assert from "node:assert/strict";
import test from "node:test";
import { renderCompactLine } from "../../../packages/extensions/src/tron/shared/compact-line/renderCompactLine.js";

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

test("renderCompactLine gives main content most width when options are long", () => {
  const line = renderCompactLine({
    width: 110,
    icon: "󰘧",
    label: "web_search",
    main: "Kaiko crypto market data pricing Tardis alternative CoinAPI pricing crypto market data",
    options: "provider=exa recencyFilter=month workflow=summary-review includeContent domains=4",
    theme,
  });

  assert.match(line, /Kaiko crypto market data pricing Tardis alternative/);
  assert.match(line, /provider=exa/);
});

test("renderCompactLine lets main content use the row when options are absent", () => {
  const line = renderCompactLine({
    width: 80,
    icon: "󰘧",
    label: "ask_user_question",
    main: "What would you like me to help you with next?",
    theme,
  });

  assert.match(line, /What would you like me to help you with next\?/);
});
