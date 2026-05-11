import assert from "node:assert/strict";
import test from "node:test";
import { stripAnsi } from "../../../packages/extension-core/src/neo-editor/shared/ui/stripAnsi.js";
import { colorSecondaryText } from "../../../packages/extension-core/src/tron/colors/colorSecondaryText.js";
import { formatUserMessageTime } from "../../../packages/extension-core/src/tron/user-message/metadata/formatUserMessageTime.js";
import { renderBottomBorder } from "../../../packages/extension-core/src/tron/user-message/renderBottomBorder.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

const NOW = new Date(2026, 3, 14, 15, 34);

test("tron formats recent user message metadata as local time only", () => {
  const timestamp = new Date(2026, 3, 14, 14, 56);

  assert.equal(formatUserMessageTime(timestamp, NOW), "2:56 PM");
});

test("tron formats older user message metadata with time and date", () => {
  const timestamp = new Date(2026, 3, 13, 14, 56);

  assert.equal(formatUserMessageTime(timestamp, NOW), "2:56 PM · 4/13/2026");
});

test("tron formats exactly twenty-four-hour-old user metadata as recent", () => {
  const timestamp = new Date(2026, 3, 13, 15, 34);

  assert.equal(formatUserMessageTime(timestamp, NOW), "3:34 PM");
});

test("tron bottom border keeps only time on the right", async () => {
  await initializePiThemes();
  const line = renderBottomBorder(80, {
    timestamp: new Date(2026, 3, 14, 14, 56),
    now: NOW,
  });

  assert.ok(line.includes(colorSecondaryText("2:56 PM")));
  assert.equal(stripAnsi(line).endsWith("2:56 PM ╯"), true);
  assert.doesNotMatch(stripAnsi(line), /claude|gpt|thinking|high|anthropic/);
});
