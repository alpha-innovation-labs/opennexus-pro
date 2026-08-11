/**
 * Returns whether the CLI arguments request session ID listing.
 *
 * @param argv Raw CLI arguments.
 * @returns True when --sessions is present.
 */
export function hasSessionsFlag(argv: readonly string[]): boolean {
	return argv.includes("--sessions");
}
