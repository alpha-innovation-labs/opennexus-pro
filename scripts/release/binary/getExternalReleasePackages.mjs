const EXTERNAL_RELEASE_PACKAGES = [
  "@ff-labs/fff-node",
  "ffi-rs",
  "@ff-labs/fff-bin-darwin-arm64",
  "@yuuang/ffi-rs-darwin-arm64",
];

/**
 * Returns package names that must stay external in the native release build.
 *
 * @returns {string[]} External package names.
 */
export function getExternalReleasePackages() {
  return [...EXTERNAL_RELEASE_PACKAGES];
}
