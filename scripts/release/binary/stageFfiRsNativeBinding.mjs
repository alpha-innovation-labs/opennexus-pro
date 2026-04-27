import { join } from "node:path";
import { copyPath } from "./copyPath.mjs";
import { getFfiRsNativeBindingFilename } from "./getFfiRsNativeBindingFilename.mjs";
import { getFfiRsPlatformPackageName } from "./getFfiRsPlatformPackageName.mjs";

/**
 * Copies the platform ffi-rs native binding into the ffi-rs package root.
 *
 * @param {string} destinationRoot Release package node_modules directory.
 * @returns {Promise<void>}
 */
export async function stageFfiRsNativeBinding(destinationRoot) {
  const packageName = getFfiRsPlatformPackageName();
  const bindingFilename = getFfiRsNativeBindingFilename();
  await copyPath(
    join(destinationRoot, ...packageName.split("/"), bindingFilename),
    join(destinationRoot, "ffi-rs", bindingFilename),
  );
}
