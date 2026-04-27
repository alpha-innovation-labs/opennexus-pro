import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sourcePath = resolve("feature-flags.json");
const outputPath = resolve("src", "feature-flags", "generated", "compiledFeatureFlags.ts");

/**
 * Builds the TypeScript source for compiled feature flags.
 *
 * @param {unknown} config Parsed feature-flag config.
 * @returns {string} TypeScript module source.
 */
function createModuleSource(config) {
  const serializedConfig = JSON.stringify(config, null, 2);
  return [
    'import type { FeatureFlagsConfig } from "../types.js";',
    "",
    "/**",
    " * Feature flags compiled into the app at build time.",
    " */",
    `export const compiledFeatureFlags = ${serializedConfig} satisfies FeatureFlagsConfig;`,
    "",
  ].join("\n");
}

/**
 * Disables dev-only entries for compiled production feature flags.
 *
 * @param {Record<string, any>} config Parsed root feature-flag config.
 * @returns {Record<string, any>} Production-safe feature-flag config.
 */
function createCompiledConfig(config) {
  return {
    ...config,
    extensions: Object.fromEntries(
      Object.entries(config.extensions).map(([id, value]) => [
        id,
        {
          ...value,
          enabled: value.devOnly ? false : value.enabled,
        },
      ]),
    ),
  };
}

/**
 * Regenerates the compiled feature-flag module from the root JSON file.
 *
 * @returns {Promise<void>}
 */
async function generateCompiledFeatureFlags() {
  const rawConfig = await readFile(sourcePath, "utf8");
  const parsedConfig = JSON.parse(rawConfig);
  const moduleSource = createModuleSource(createCompiledConfig(parsedConfig));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, moduleSource, "utf8");
}

await generateCompiledFeatureFlags();
