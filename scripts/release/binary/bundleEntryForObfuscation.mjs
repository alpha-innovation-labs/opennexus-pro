import { getBundledEntryPath } from "./getBundledEntryPath.mjs";
import { getExternalReleasePackages } from "./getExternalReleasePackages.mjs";
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
    "./src/index.release.ts",
    "--outdir",
    buildWorkDir,
    "--entry-naming",
    "nexus.bundle",
    "--target",
    "bun",
    "--format",
    "esm",
    ...getExternalReleasePackages().flatMap((packageName) => ["--external", packageName]),
  ]);

  return bundledEntryPath;
}
