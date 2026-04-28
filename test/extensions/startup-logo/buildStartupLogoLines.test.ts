import assert from "node:assert/strict";
import test from "node:test";
import { buildStartupLogoLines } from "../../../packages/extensions/src/startup-logo/buildStartupLogoLines.js";

test("startup logo renders real glyphs instead of escaped unicode text", () => {
  const lines = buildStartupLogoLines({ fg: (_name, value) => value });

  assert.equal(lines[0].includes("\\u2588"), false);
  assert.equal(lines[0].startsWith("███"), true);
  assert.equal(Math.max(...lines.map((line) => Array.from(line).length)) < 80, true);
});
