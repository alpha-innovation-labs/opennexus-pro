import { join } from "node:path";
import { copyPath } from "./copyPath.mjs";
import { getFfiRsNativeBindingFilename } from "./getFfiRsNativeBindingFilename.mjs";
import { getFfiRsPlatformPackageName } from "./getFfiRsPlatformPackageName.mjs";
import { getReleaseTargetOptions } from "./getReleaseTargetOptions.mjs";

/**
 * Copies the platform ffi-rs native binding into the ffi-rs package root.
 *
 * @param {string} destinationRoot Release package node_modules directory.
 * @returns {Promise<void>}
 */
export async function stageFfiRsNativeBinding(destinationRoot) {
  const targetOptions = getReleaseTargetOptions();
  const packageName = getFfiRsPlatformPackageName(targetOptions);
  const bindingFilename = getFfiRsNativeBindingFilename(targetOptions);
  await copyPath(
    join(destinationRoot, ...packageName.split("/"), bindingFilename),
    join(destinationRoot, "ffi-rs", bindingFilename),
  );
}
