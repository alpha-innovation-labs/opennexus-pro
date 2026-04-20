/**
 * Checks whether one project-relative test file depends on a built release.
 *
 * @param {string} filePath Project-relative file path.
 * @returns {boolean} True when the file is under the release executable e2e suite.
 */
export function isReleaseExecutableTestFile(filePath) {
  return filePath.startsWith("test/e2e/release-executable/");
}
