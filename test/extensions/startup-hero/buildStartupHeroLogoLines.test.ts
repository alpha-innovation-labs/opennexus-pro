import assert from "node:assert/strict";
import test from "node:test";
import { buildStartupHeroLogoLines } from "../../../packages/extensions/src/startup-hero/buildStartupHeroLogoLines.js";

test("startup hero renders real glyphs instead of escaped unicode text", () => {
  const lines = buildStartupHeroLogoLines({ fg: (_name, value) => value });

  assert.equal(lines[0].includes("\\u2588"), false);
  assert.equal(lines[0].startsWith("███"), true);
  assert.equal(Math.max(...lines.map((line) => Array.from(line).length)) < 80, true);
});
