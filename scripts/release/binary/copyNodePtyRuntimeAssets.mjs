import { join, resolve } from "node:path";
import { copyPath } from "./copyPath.mjs";
import { setExecutableMode } from "./setExecutableMode.mjs";

const NODE_PTY_ROOT = resolve("node_modules", "node-pty");

/**
 * Copies only the node-pty files required by the native bundle.
 *
 * @param {string} bundleDir Bundle output directory.
 * @returns {Promise<void>}
 */
export async function copyNodePtyRuntimeAssets(bundleDir) {
  const destinationRoot = join(bundleDir, "runtime", "node_modules", "node-pty");
  const copies = [
    [join(NODE_PTY_ROOT, "lib"), join(destinationRoot, "lib")],
    [join(NODE_PTY_ROOT, "prebuilds", "darwin-arm64"), join(destinationRoot, "prebuilds", "darwin-arm64")],
    [join(NODE_PTY_ROOT, "LICENSE"), join(destinationRoot, "LICENSE")],
  ];

  for (const [source, destination] of copies) {
    await copyPath(source, destination);
  }

  await setExecutableMode(join(destinationRoot, "prebuilds", "darwin-arm64", "spawn-helper"));
}
