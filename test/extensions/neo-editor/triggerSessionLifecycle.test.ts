import assert from "node:assert/strict";
import test from "node:test";
import { getActiveTriggerState } from "../../../packages/extensions/src/neo-editor/features/promptline/trigger/getActiveTriggerState.js";
import { clearTriggerSession, startTriggerSession, updateTriggerSessionPrefix } from "../../../packages/extensions/src/neo-editor/features/promptline/trigger/sessionState.js";

/**
 * Resets trigger-session state between tests.
 */
function resetTriggerSession(): void {
  clearTriggerSession();
}

test.beforeEach(resetTriggerSession);
test.after(resetTriggerSession);

test("trigger sessions track the latest active prefix", () => {
  startTriggerSession("at", "@");
  updateTriggerSessionPrefix("@src");

  assert.deepEqual(getActiveTriggerState("@src"), { kind: "at", prefix: "@src" });
});

test("trigger sessions invalidate when the text no longer matches the active trigger kind", () => {
  startTriggerSession("at", "@");

  assert.equal(getActiveTriggerState("/reload"), null);
});
