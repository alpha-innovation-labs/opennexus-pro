import assert from "node:assert/strict";
import test from "node:test";
import {
  createExtensionFeatureFlagReport,
  createExtensionFeatureFlags,
  getEnabledExtensionFeatureFlags,
  readFeatureFlagsConfig,
} from "../../src/feature-flags/index.js";

test("extension feature flags are loaded from the root json config", () => {
  const config = readFeatureFlagsConfig();
  const flags = createExtensionFeatureFlags();
  const enabledIds = getEnabledExtensionFeatureFlags(flags)
    .map((flag) => flag.id)
    .sort();
  const report = createExtensionFeatureFlagReport(flags);

  assert.equal(config.extensions.playground?.enabled, false);
  assert.equal(config.extensions.workspace?.enabled, false);
  assert.ok(flags.every((flag) => flag.features.length > 0));
  assert.deepEqual(enabledIds, ["neo-editor", "observations", "term-modal", "todo", "tron"].sort());
  assert.match(report, /playground: disabled/);
  assert.match(report, /workspace: disabled/);
  assert.match(report, /usage meter/);
  assert.match(report, /tool calls browser/);
});
