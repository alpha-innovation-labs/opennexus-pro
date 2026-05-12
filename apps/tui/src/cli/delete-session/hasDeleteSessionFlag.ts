/**
 * Returns whether the CLI arguments request session deletion.
 *
 * @param argv Raw CLI arguments.
 * @returns True when --delete-session is present.
 */
export function hasDeleteSessionFlag(argv: readonly string[]): boolean {
  return argv.some((arg) => arg === "--delete-session" || arg.startsWith("--delete-session="));
}
