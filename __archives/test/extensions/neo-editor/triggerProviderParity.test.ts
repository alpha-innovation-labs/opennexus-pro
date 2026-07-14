import assert from "node:assert/strict";
import test from "node:test";
import { getTriggerProvider } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/getTriggerProvider.js";
import { routeTriggerInput } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/routeTriggerInput.js";

const triggerKinds = ["at", "slash"] as const;

for (const kind of triggerKinds) {
  test(`trigger provider for ${kind} exposes the shared controller contract`, () => {
    const provider = getTriggerProvider(kind);

    assert.equal(typeof provider.routeInput, "function");
    assert.equal(typeof provider.getModal, "function");
    assert.equal(typeof provider.refresh, "function");
  });
}

test("trigger providers delegate input routing through the shared routing helper", () => {
  const atProvider = getTriggerProvider("at");
  const slashProvider = getTriggerProvider("slash");

  assert.equal(atProvider.routeInput("a", routeTriggerInput), false);
  assert.equal(atProvider.routeInput("\u0010", routeTriggerInput), true);
  assert.equal(slashProvider.routeInput("a", routeTriggerInput), true);
});
