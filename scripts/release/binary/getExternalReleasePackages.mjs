import { getFffPlatformPackageName } from "./getFffPlatformPackageName.mjs";
import { getFfiRsPlatformPackageName } from "./getFfiRsPlatformPackageName.mjs";
import { getReleaseTargetOptions } from "./getReleaseTargetOptions.mjs";

const BASE_EXTERNAL_RELEASE_PACKAGES = ["@ff-labs/fff-node", "ffi-rs", "linkedom", "turndown"];

/**
 * Returns package names that must stay external in the native release build.
 *
 * @returns {string[]} External package names.
 */
export function getExternalReleasePackages() {
  const targetOptions = getReleaseTargetOptions();
  return [
    ...BASE_EXTERNAL_RELEASE_PACKAGES,
    getFffPlatformPackageName(targetOptions),
    getFfiRsPlatformPackageName(targetOptions),
  ];
}
