import { writeFile } from "node:fs/promises";
import { getReleaseEntrypointPath } from "./getReleaseEntrypointPath.mjs";

/**
 * Writes the ignored release-build entrypoint that registers embedded assets before booting Nexus.
 *
 * @param {string} buildWorkDir Release workspace directory.
 * @returns {Promise<string>} Absolute generated entrypoint path.
 */
export async function writeReleaseEntrypoint(buildWorkDir) {
  const outputPath = getReleaseEntrypointPath(buildWorkDir);
  const content = [
    'import { embeddedPackageAssetVersion, embeddedPackageAssets } from "./embeddedPackageAssets.ts";',
    'import { setEmbeddedPackageAssets } from "../../packages/nexus-runtime/src/package/embedded-assets/setEmbeddedPackageAssets.ts";',
    "",
    "setEmbeddedPackageAssets({ embeddedPackageAssetVersion, embeddedPackageAssets });",
    'await import("../../apps/tui/src/index.release.ts");',
    "",
  ].join("\n");

  await writeFile(outputPath, content, "utf8");
  return outputPath;
}
