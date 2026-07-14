import assert from "node:assert/strict";
import test from "node:test";
import { getActiveTriggerState } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/getActiveTriggerState.js";
import { removeTriggerPrefixFromLines } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/removeTriggerPrefixFromLines.js";
import { routeTriggerInput } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/routeTriggerInput.js";
import { clearTriggerSession, startTriggerSession } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/sessionState.js";

/**
 * Resets the active trigger session between tests.
 */
function resetTriggerSession(): void {
  clearTriggerSession();
}

test.beforeEach(resetTriggerSession);
test.after(resetTriggerSession);

test("slash sessions stay inactive after cancel until a new slash is typed", () => {
  startTriggerSession("slash", "/");
  assert.deepEqual(getActiveTriggerState("/re"), { kind: "slash", prefix: "/re" });

  clearTriggerSession();

  assert.equal(getActiveTriggerState("/reload"), null);
});

test("routeTriggerInput captures all keys for slash but only navigation keys for at", () => {
  assert.equal(routeTriggerInput("slash", "a"), true);
  assert.equal(routeTriggerInput("slash", " "), true);
  assert.equal(routeTriggerInput("at", "a"), false);
  assert.equal(routeTriggerInput("at", "\u0010"), true);
});

test("removeTriggerPrefixFromLines removes slash menu text from the editor", () => {
  assert.equal(removeTriggerPrefixFromLines(["/"], 0, 1, "/"), "");
  assert.equal(removeTriggerPrefixFromLines(["/res", "next"], 0, 4, "/res"), "\nnext");
});
