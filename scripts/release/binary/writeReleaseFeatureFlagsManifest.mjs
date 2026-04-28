import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createCompiledFeatureFlagsConfig } from "../../feature-flags/createCompiledFeatureFlagsConfig.mjs";
import { getCompiledEnabledExtensionIds } from "../../feature-flags/getCompiledEnabledExtensionIds.mjs";

/**
 * Writes the release-visible feature flag manifest next to other runtime assets.
 *
 * @param {string} packageDir Release package asset directory.
 * @param {Record<string, any> | undefined} config Optional parsed feature-flag config.
 * @returns {Promise<void>}
 */
export async function writeReleaseFeatureFlagsManifest(packageDir, config = undefined) {
  const rootConfig = config ?? JSON.parse(await readFile(resolve("feature-flags.json"), "utf8"));
  const compiledConfig = createCompiledFeatureFlagsConfig(rootConfig);
  const enabledExtensionIds = getCompiledEnabledExtensionIds(compiledConfig);
  const outputDir = join(packageDir, "runtime", "feature-flags");

  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, "compiled-feature-flags.json"), `${JSON.stringify(compiledConfig, null, 2)}\n`, "utf8");
  await writeFile(join(outputDir, "compiled-enabled-extensions.json"), `${JSON.stringify({ extensionIds: enabledExtensionIds }, null, 2)}\n`, "utf8");
}
