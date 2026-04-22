import { join, resolve } from "node:path";
import { copyPath } from "./copyPath.mjs";
import { getExternalReleasePackages } from "./getExternalReleasePackages.mjs";

/**
 * Copies external runtime packages needed by the compiled release binary.
 *
 * @param {string} bundleDir Bundle output directory.
 * @returns {Promise<void>}
 */
export async function copyExternalReleasePackages(bundleDir) {
  const destinationRoot = join(bundleDir, "package", "node_modules");

  for (const packageName of getExternalReleasePackages()) {
    await copyPath(resolve("node_modules", ...packageName.split("/")), join(destinationRoot, ...packageName.split("/")));
  }
}
