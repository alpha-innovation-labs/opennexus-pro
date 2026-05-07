import assert from "node:assert/strict";
import test from "node:test";
import { setRuntimeExtensionFeatureState } from "../../../packages/feature-flags/src/runtimeExtensionFeatureState.js";
import { getHotkeysCommandHook } from "../../../packages/pi-platform/src/hotkeysCommandHook.js";
import { clearHotkeysCommandHook } from "../../../packages/extensions/src/hotkeys/clearHotkeysCommandHook.js";
import { registerHotkeysCommandHook } from "../../../packages/extensions/src/hotkeys/registerHotkeysCommandHook.js";

test.afterEach(() => {
  setRuntimeExtensionFeatureState("hotkeys", true);
  clearHotkeysCommandHook();
});

test("disabled hotkeys clears stale /hotkeys hook instead of opening custom modal", async () => {
  registerHotkeysCommandHook();
  assert.equal(typeof getHotkeysCommandHook(), "function");

  setRuntimeExtensionFeatureState("hotkeys", false);
  await getHotkeysCommandHook()?.({});

  assert.equal(getHotkeysCommandHook(), undefined);
});
