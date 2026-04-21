import assert from "node:assert/strict";
import test from "node:test";
import { getBundledDefaultSettingsPath } from "../../../src/runtime/config/default-settings/getBundledDefaultSettingsPath.js";

test("getBundledDefaultSettingsPath resolves the bundled defaults file in source mode", () => {
  assert.match(getBundledDefaultSettingsPath(), /\/src\/runtime\/config\/default-settings\/settings\.json$/);
});
