import assert from "node:assert/strict";
import test from "node:test";
import { getActiveTriggerState } from "../../../src/extensions/neo-editor/promptline/trigger/getActiveTriggerState.js";
import { clearTriggerSession, startTriggerSession, updateTriggerSessionPrefix } from "../../../src/extensions/neo-editor/promptline/trigger/sessionState.js";

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
