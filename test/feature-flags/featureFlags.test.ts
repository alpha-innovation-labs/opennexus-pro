import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createExtensionFeatureFlagReport,
  createExtensionFeatureFlags,
  getBundledFeatureFlagsConfig,
  getEnabledExtensionFeatureFlags,
  readFeatureFlagsConfig,
} from "../../src/feature-flags/index.js";
import { createFakeCmuxExecutable } from "../support/cmux/createFakeCmuxExecutable.js";
import { removeFakeCmuxExecutable } from "../support/cmux/removeFakeCmuxExecutable.js";
import { withLockedCmuxEnv } from "../support/cmux/withLockedCmuxEnv.js";

test("extension feature flags are compiled from the root json config", () => {
  const rootConfig = JSON.parse(readFileSync("feature-flags.json", "utf8"));
  const config = readFeatureFlagsConfig();
  const bundledConfig = getBundledFeatureFlagsConfig();
  const flags = createExtensionFeatureFlags();
  const enabledIds = getEnabledExtensionFeatureFlags(flags)
    .map((flag) => flag.id)
    .sort();
  const report = createExtensionFeatureFlagReport(flags);

  assert.deepEqual(config, rootConfig);
  assert.deepEqual(bundledConfig, config);
  assert.equal(config.extensions.cmux?.enabled, true);
  assert.equal(config.extensions.playground?.enabled, false);
  assert.equal(config.extensions.workspace?.enabled, false);
  assert.equal(config.extensions["sub-agents"]?.enabled, true);
  assert.equal(config.extensions["sub-agent-status-widget"]?.enabled, true);
  assert.ok(flags.every((flag) => flag.features.length > 0));
  assert.deepEqual(
    enabledIds,
    flags
      .filter((flag) => flag.enabled)
      .map((flag) => flag.id)
      .sort(),
  );
  assert.match(report, /annotate: enabled/);
  assert.match(report, /clipboard-image-paste: enabled/);
  assert.match(report, /kanban: enabled/);
  assert.match(report, /notify: enabled/);
  assert.match(report, /exit-message: enabled/);
  assert.match(report, /startup-logo: enabled/);
  assert.match(report, /sub-agents: enabled/);
  assert.match(report, /sub-agent-status-widget: enabled/);
  assert.match(report, /playground: disabled/);
  assert.match(report, /workspace: disabled/);
  assert.match(report, /sync session title to cmux pane title/);
  assert.match(report, /notify cmux tab when pane is done/);
  assert.match(report, /macOS ctrl\+v image paste fallback for release builds/);
  assert.match(report, /two-pane task board modal/);
  assert.match(report, /desktop notification on agent completion/);
  assert.match(report, /NEXUS_NOTIFY_SOUND_CMD override/);
  assert.match(report, /print session title on app exit/);
  assert.match(report, /show N logo on fresh startup/);
  assert.match(report, /usage meter/);
  assert.match(report, /tool calls browser/);
  assert.match(report, /rpc child-process subagent execution/);
  assert.match(report, /custom subagent working widget/);
});

test("cmux feature flag is enabled only when the cmux binary is available", async () => {
  await withLockedCmuxEnv(async () => {
    const fakeCmux = await createFakeCmuxExecutable();
    const previousCmuxBin = process.env.NEXUS_CMUX_BIN;

    try {
      process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
      const enabledFlag = createExtensionFeatureFlags().find((flag) => flag.id === "cmux");

      process.env.NEXUS_CMUX_BIN = `${fakeCmux.directoryPath}/missing-cmux`;
      const disabledFlag = createExtensionFeatureFlags().find((flag) => flag.id === "cmux");

      assert.equal(enabledFlag?.enabled, true);
      assert.equal(disabledFlag?.enabled, false);
    } finally {
      if (previousCmuxBin) process.env.NEXUS_CMUX_BIN = previousCmuxBin;
      else delete process.env.NEXUS_CMUX_BIN;
      await removeFakeCmuxExecutable(fakeCmux.directoryPath);
    }
  });
});
