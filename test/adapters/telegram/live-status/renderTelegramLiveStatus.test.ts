import assert from "node:assert/strict";
import test from "node:test";
import { createTelegramLiveStatusState } from "../../../../src/adapters/telegram/live-status/createTelegramLiveStatusState.js";
import { renderTelegramLiveStatus } from "../../../../src/adapters/telegram/live-status/renderTelegramLiveStatus.js";

test("renderTelegramLiveStatus renders a compact live status message", () => {
  const state = createTelegramLiveStatusState();
  state.thinkingLine = "Thinking about the repo";
  state.toolLines.push("✓ read — path=\"src/index.ts\"");

  assert.equal(renderTelegramLiveStatus(state), "- Thinking about the repo\n  - ✓ read — path=\"src/index.ts\"");
});
