/**
 * Returns whether the CLI arguments request all-project session listing.
 *
 * @param argv Raw CLI arguments.
 * @returns True when --sessions-all is present.
 */
export function hasSessionsAllFlag(argv: readonly string[]): boolean {
	return argv.includes("--sessions-all");
}
