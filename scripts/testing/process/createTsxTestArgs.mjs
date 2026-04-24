/**
 * Creates the argument list used to run selected TypeScript tests with tsx.
 *
 * @param {string[]} testFiles Project-relative test file paths.
 * @param {number} concurrency Positive integer Node test runner concurrency.
 * @returns {string[]} Arguments passed to the tsx executable.
 */
export function createTsxTestArgs(testFiles, concurrency) {
  return ["--test", `--test-concurrency=${concurrency}`, ...testFiles];
}
