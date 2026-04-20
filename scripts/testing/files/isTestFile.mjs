/**
 * Checks whether one project-relative file path is a TypeScript test file.
 *
 * @param {string} filePath Project-relative file path.
 * @returns {boolean} True when the path points to a `.test.ts` file.
 */
export function isTestFile(filePath) {
  return filePath.endsWith(".test.ts");
}
