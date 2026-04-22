import { join } from "node:path";
import { copyPath } from "./copyPath.mjs";

/**
 * Copies the platform ffi-rs native binding into the ffi-rs package root.
 *
 * @param {string} destinationRoot Release package node_modules directory.
 * @returns {Promise<void>}
 */
export async function stageFfiRsNativeBinding(destinationRoot) {
  await copyPath(
    join(destinationRoot, "@yuuang", "ffi-rs-darwin-arm64", "ffi-rs.darwin-arm64.node"),
    join(destinationRoot, "ffi-rs", "ffi-rs.darwin-arm64.node"),
  );
}
