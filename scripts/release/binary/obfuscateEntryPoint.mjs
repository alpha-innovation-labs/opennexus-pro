import { readFile, writeFile } from "node:fs/promises";
import JavaScriptObfuscator from "javascript-obfuscator";
import { getObfuscatedEntryPath } from "./getObfuscatedEntryPath.mjs";

/**
 * Obfuscates the bundled app entry before native compilation.
 *
 * @param {string} bundledEntryPath Bundled JavaScript entry path.
 * @param {string} buildWorkDir Release workspace directory.
 * @returns {Promise<string>} Obfuscated entry path.
 */
export async function obfuscateEntryPoint(bundledEntryPath, buildWorkDir) {
  const inputCode = await readFile(bundledEntryPath, "utf8");
  const outputPath = getObfuscatedEntryPath(buildWorkDir);
  const result = JavaScriptObfuscator.obfuscate(inputCode, {
    compact: true,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    seed: 42,
    simplify: false,
    splitStrings: false,
    stringArray: false,
    target: "node",
    transformObjectKeys: false,
  });

  await writeFile(outputPath, result.getObfuscatedCode(), "utf8");
  return outputPath;
}
