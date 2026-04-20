import { getBundledEntryPath } from "./getBundledEntryPath.mjs";
import { runBunBuild } from "./runBunBuild.mjs";

/**
 * Bundles the app entry into one JavaScript file before obfuscation.
 *
 * @param {string} buildWorkDir Release workspace directory.
 * @returns {Promise<string>} Bundled entry path.
 */
export async function bundleEntryForObfuscation(buildWorkDir) {
  const bundledEntryPath = getBundledEntryPath(buildWorkDir);

  await runBunBuild([
    "build",
    "./src/index.ts",
    "--outfile",
    bundledEntryPath,
    "--target",
    "bun",
    "--format",
    "esm",
  ]);

  return bundledEntryPath;
}
