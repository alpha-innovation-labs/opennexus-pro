import { readFile, writeFile } from "node:fs/promises";
import { transformAsync } from "@babel/core";
import transformUnicodeSetsRegex from "@babel/plugin-transform-unicode-sets-regex";

/**
 * Rewrites modern regex syntax so the obfuscator can parse the bundle.
 *
 * @param {string} bundledEntryPath Bundled JavaScript entry path.
 * @returns {Promise<void>}
 */
export async function transpileBundleForObfuscation(bundledEntryPath) {
  const sourceCode = await readFile(bundledEntryPath, "utf8");
  const result = await transformAsync(sourceCode, {
    babelrc: false,
    configFile: false,
    comments: false,
    compact: false,
    plugins: [transformUnicodeSetsRegex],
    sourceMaps: false,
  });

  if (!result?.code) {
    throw new Error("Failed to transpile the bundled entry for obfuscation.");
  }

  await writeFile(bundledEntryPath, result.code, "utf8");
}
