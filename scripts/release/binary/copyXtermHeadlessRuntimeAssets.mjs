import { join, resolve } from "node:path";
import { copyPath } from "./copyPath.mjs";

const XTERM_HEADLESS_ROOT = resolve("node_modules", "@xterm", "headless");

/**
 * Copies only the xterm headless files required by the native bundle.
 *
 * @param {string} bundleDir Bundle output directory.
 * @returns {Promise<void>}
 */
export async function copyXtermHeadlessRuntimeAssets(bundleDir) {
  const destinationRoot = join(bundleDir, "runtime", "node_modules", "@xterm", "headless");
  await copyPath(
    join(XTERM_HEADLESS_ROOT, "lib-headless"),
    join(destinationRoot, "lib-headless"),
  );
}
