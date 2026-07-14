import assert from "node:assert/strict";
import test from "node:test";
import {
  clearActiveAssistantTurnTiming,
  getCurrentAssistantStartedAt,
  getCurrentAssistantTurnStartedAt,
  resetAssistantMessageTimings,
  startAssistantMessageTiming,
} from "../../../packages/extension-core/src/tron/thinking/assistantMessageTimingState.ts";

test("assistant timing keeps the first LLM start across tool turns", () => {
  resetAssistantMessageTimings();

  startAssistantMessageTiming(1000);
  assert.equal(getCurrentAssistantTurnStartedAt(), 1000);
  assert.equal(getCurrentAssistantStartedAt(), 1000);

  startAssistantMessageTiming(4000);
  assert.equal(getCurrentAssistantTurnStartedAt(), 1000);
  assert.equal(getCurrentAssistantStartedAt(), 4000);

  clearActiveAssistantTurnTiming();
  assert.equal(getCurrentAssistantTurnStartedAt(), undefined);
  assert.equal(getCurrentAssistantStartedAt(), undefined);
});
