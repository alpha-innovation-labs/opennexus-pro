/**
 * Parses command line flags for the CodexBar sync checker.
 *
 * @param {string[]} argv Raw command line arguments.
 * @returns {{ mark: boolean }} Parsed options.
 */
export function parseCodexBarSyncArgs(argv) {
  return { mark: argv.includes("--mark") };
}
