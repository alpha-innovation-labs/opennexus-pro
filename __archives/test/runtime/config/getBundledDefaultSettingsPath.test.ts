import assert from "node:assert/strict";
import test from "node:test";
import { getBundledDefaultSettingsPath } from "../../../packages/assets/src/default-settings/getBundledDefaultSettingsPath.js";

test("getBundledDefaultSettingsPath resolves the bundled defaults file in source mode", () => {
  assert.match(getBundledDefaultSettingsPath(), /\/packages\/assets\/src\/default-settings\/settings\.json$/);
});
