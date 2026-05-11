/**
 * Reports whether raw CLI arguments request help output.
 *
 * @param argv Raw CLI arguments.
 * @returns True when a help flag is present.
 */
export function hasMiniAppHelpFlag(argv: readonly string[]): boolean {
	return argv.includes("-h") || argv.includes("--help");
}
