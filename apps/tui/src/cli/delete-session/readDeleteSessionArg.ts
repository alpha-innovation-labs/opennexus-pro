/**
 * Reads the required session reference from --delete-session.
 *
 * @param argv Raw CLI arguments.
 * @returns The requested session reference, if present.
 */
export function readDeleteSessionArg(argv: readonly string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--delete-session") {
      const nextArg = argv[index + 1];
      return typeof nextArg === "string" && !nextArg.startsWith("-") ? nextArg : undefined;
    }
    if (arg.startsWith("--delete-session=")) {
      const value = arg.slice("--delete-session=".length).trim();
      return value.length > 0 ? value : undefined;
    }
  }

  return undefined;
}
