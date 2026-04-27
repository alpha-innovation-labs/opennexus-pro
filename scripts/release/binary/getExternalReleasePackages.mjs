import { getFffPlatformPackageName } from "./getFffPlatformPackageName.mjs";
import { getFfiRsPlatformPackageName } from "./getFfiRsPlatformPackageName.mjs";

const BASE_EXTERNAL_RELEASE_PACKAGES = ["@ff-labs/fff-node", "ffi-rs"];

/**
 * Returns package names that must stay external in the native release build.
 *
 * @returns {string[]} External package names.
 */
export function getExternalReleasePackages() {
  return [
    ...BASE_EXTERNAL_RELEASE_PACKAGES,
    getFffPlatformPackageName(),
    getFfiRsPlatformPackageName(),
  ];
}
