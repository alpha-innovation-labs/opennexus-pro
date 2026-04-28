import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  applySystemExtensionAvailability,
  createExtensionFeatureFlagReport,
  createExtensionFeatureFlags,
  getBundledFeatureFlagsConfig,
  getEnabledExtensionFeatureFlags,
  readFeatureFlagsConfig,
} from "../../packages/feature-flags/src/index.js";
import { createFakeCmuxExecutable } from "../support/cmux/createFakeCmuxExecutable.js";
import { removeFakeCmuxExecutable } from "../support/cmux/removeFakeCmuxExecutable.js";
import { withLockedCmuxEnv } from "../support/cmux/withLockedCmuxEnv.js";
import { createModifiedFeatureFlagsConfig } from "../support/feature-flags/createModifiedFeatureFlagsConfig.js";
import { readRootFeatureFlagsConfig } from "../support/feature-flags/readRootFeatureFlagsConfig.js";
import { runFeatureFlagGenerators } from "../support/feature-flags/runFeatureFlagGenerators.js";
import { withLockedFeatureFlagsConfig } from "../support/feature-flags/withLockedFeatureFlagsConfig.js";
import { writeRootFeatureFlagsConfig } from "../support/feature-flags/writeRootFeatureFlagsConfig.js";

test("source runtime feature flags come from the root json config", async () => {
  const rootConfig = await readRootFeatureFlagsConfig();
  const runtimeConfig = readFeatureFlagsConfig();
  const expectedRuntimeConfig = applySystemExtensionAvailability(rootConfig);
  const flags = createExtensionFeatureFlags();
  const enabledIds = getEnabledExtensionFeatureFlags(flags)
    .map((flag) => flag.id)
    .sort();
  const expectedEnabledIds = Object.entries(expectedRuntimeConfig.extensions)
    .filter(([, value]) => value.enabled)
    .map(([id]) => id)
    .sort();
  const report = createExtensionFeatureFlagReport(flags);

  assert.deepEqual(runtimeConfig, rootConfig);
  assert.equal(flags.length, Object.keys(rootConfig.extensions).length);
  assert.ok(flags.every((flag) => flag.features.length > 0));
  assert.deepEqual(enabledIds, expectedEnabledIds);

  for (const [id, value] of Object.entries(expectedRuntimeConfig.extensions)) {
    assert.match(report, new RegExp(`${id}: ${value.enabled ? "enabled" : "disabled"}`));
  }

  assert.match(report, /FFF-backed read override/);
  assert.match(report, /rtk rewrite for bash/);
  assert.match(report, /rtk-native read\/find\/ls\/grep tools/);
  assert.match(report, /desktop notification on agent completion/);
  assert.match(report, /print session title on app exit/);
  assert.match(report, /show N logo, version, tips, and startup status/);
  assert.match(report, /tool calls browser/);
  assert.match(report, /\/usage history graph modal/);
  assert.match(report, /workspace top bar/);
  assert.match(report, /dev-only modal variation playground/);
});

test("source runtime picks up root json changes without regenerating release artifacts", async () => {
  await withLockedFeatureFlagsConfig(async () => {
    const originalConfig = await readRootFeatureFlagsConfig();
    const originalCompiledFeatureFlagsSource = await readFile("packages/feature-flags/src/generated/compiledFeatureFlags.ts", "utf8");
    const modifiedConfig = createModifiedFeatureFlagsConfig(originalConfig, ["annotate", "workspace"]);

    try {
      await writeRootFeatureFlagsConfig(modifiedConfig);

      const runtimeConfig = readFeatureFlagsConfig();
      const enabledIds = getEnabledExtensionFeatureFlags(createExtensionFeatureFlags())
        .map((flag) => flag.id)
        .sort();
      const compiledFeatureFlagsSource = await readFile("packages/feature-flags/src/generated/compiledFeatureFlags.ts", "utf8");

      assert.deepEqual(runtimeConfig, modifiedConfig);
      assert.notDeepEqual(getBundledFeatureFlagsConfig(), modifiedConfig);
      assert.deepEqual(enabledIds, ["annotate", "workspace"]);
      assert.equal(compiledFeatureFlagsSource, originalCompiledFeatureFlagsSource);
    } finally {
      await writeRootFeatureFlagsConfig(originalConfig);
    }
  });
});

test("release generators rebuild compiled feature flags and extension ids from the root json config", async () => {
  await withLockedFeatureFlagsConfig(async () => {
    const originalConfig = await readRootFeatureFlagsConfig();
    const originalCompiledFeatureFlagsSource = await readFile("packages/feature-flags/src/generated/compiledFeatureFlags.ts", "utf8");
    const originalCompiledExtensionsSource = await readFile("packages/extensions/src/generated/registerCompiledEnabledExtensions.ts", "utf8");
    const modifiedConfig = createModifiedFeatureFlagsConfig(originalConfig, ["annotate", "workspace"]);

    try {
      await writeRootFeatureFlagsConfig(modifiedConfig);
      await runFeatureFlagGenerators();

      const compiledFeatureFlagsSource = await readFile("packages/feature-flags/src/generated/compiledFeatureFlags.ts", "utf8");
      const compiledExtensionsSource = await readFile("packages/extensions/src/generated/registerCompiledEnabledExtensions.ts", "utf8");

      assert.match(compiledFeatureFlagsSource, /"annotate": \{[\s\S]*?"enabled": true/);
      assert.match(compiledFeatureFlagsSource, /"workspace": \{[\s\S]*?"enabled": true/);
      assert.match(compiledExtensionsSource, /export const compiledBundledExtensionIds = \[\n  "annotate",\n  "workspace"\n\] as const;/);
      assert.doesNotMatch(compiledExtensionsSource, /dev-modal/);
    } finally {
      await writeRootFeatureFlagsConfig(originalConfig);
      await runFeatureFlagGenerators();
      assert.equal(await readFile("packages/feature-flags/src/generated/compiledFeatureFlags.ts", "utf8"), originalCompiledFeatureFlagsSource);
      assert.equal(await readFile("packages/extensions/src/generated/registerCompiledEnabledExtensions.ts", "utf8"), originalCompiledExtensionsSource);
    }
  });
});

test("compiled production feature flags disable dev-only extensions", () => {
  const bundledConfig = getBundledFeatureFlagsConfig();

  assert.equal(bundledConfig.extensions.dev?.devOnly, true);
  assert.equal(bundledConfig.extensions.dev?.enabled, false);
  assert.equal(bundledConfig.extensions["feature-management"]?.enabled, true);
});

test("release build pipeline regenerates compiled feature flag artifacts before bundling", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { scripts: Record<string, string> };
  const releaseJustfile = readFileSync("justfiles/building/release.just", "utf8");

  assert.equal(
    packageJson.scripts["build:binary"],
    "npm run generate:feature-flags && node scripts/release/buildBinaryBundle.mjs",
  );
  assert.match(releaseJustfile, /npm run build:release/);
});

test("cmux runtime availability only enables cmux when the binary exists", async () => {
  await withLockedCmuxEnv(async () => {
    const fakeCmux = await createFakeCmuxExecutable();
    const previousCmuxBin = process.env.NEXUS_CMUX_BIN;
    const config = {
      extensions: {
        cmux: {
          enabled: true,
          features: ["sync session title to cmux pane title"],
        },
      },
    };

    try {
      process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
      const enabledConfig = applySystemExtensionAvailability(config);

      process.env.NEXUS_CMUX_BIN = `${fakeCmux.directoryPath}/missing-cmux`;
      const disabledConfig = applySystemExtensionAvailability(config);

      assert.equal(enabledConfig.extensions.cmux?.enabled, true);
      assert.equal(disabledConfig.extensions.cmux?.enabled, false);
    } finally {
      if (previousCmuxBin) process.env.NEXUS_CMUX_BIN = previousCmuxBin;
      else delete process.env.NEXUS_CMUX_BIN;
      await removeFakeCmuxExecutable(fakeCmux.directoryPath);
    }
  });
});
