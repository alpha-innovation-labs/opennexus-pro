import assert from "node:assert/strict";
import test from "node:test";
import { ThinkingLabelBlock } from "../../../src/extensions/tron/thinking/ThinkingLabelBlock.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

test("thinking label block reuses cached lines for unchanged width", async () => {
  await initializePiThemes();
  const block = new ThinkingLabelBlock("Reviewed the relevant files", false);

  const first = block.render(80);
  const second = block.render(80);

  assert.equal(second, first);
});

test("thinking label block refreshes cached lines when width changes", async () => {
  await initializePiThemes();
  const block = new ThinkingLabelBlock("Reviewed the relevant files", false);

  const first = block.render(80);
  const second = block.render(40);

  assert.notEqual(second, first);
});
