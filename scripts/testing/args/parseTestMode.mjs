/**
 * Parses the supported `just test` arguments.
 *
 * @param {string[]} args CLI arguments passed after `just test`.
 * @returns {"without-release" | "with-release"} Requested test mode.
 */
export function parseTestMode(args) {
  if (args.length === 0) {
    return "without-release";
  }

  if (args.length === 1 && args[0] === "--with-release") {
    return "with-release";
  }

  throw new Error('Unsupported test arguments. Use "just test" or "just test --with-release".');
}
