/**
 * Returns whether the CLI arguments request JSON output.
 *
 * @param argv Raw CLI arguments.
 * @returns True when --json is present.
 */
export function hasJsonFlag(argv: readonly string[]): boolean {
	return argv.includes("--json");
}
