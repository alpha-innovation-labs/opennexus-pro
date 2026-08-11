/**
 * Returns whether the CLI arguments request the app version.
 *
 * @param argv Raw CLI arguments.
 * @returns True when --version or -v is present.
 */
export function hasVersionFlag(argv: string[]): boolean {
	return argv.includes("--version") || argv.includes("-v");
}
