/**
 * Reports whether argv requests help for the current command scope.
 *
 * @param argv Raw CLI args for one command scope.
 * @returns True when -h or --help is present.
 */
export function hasHelpFlag(argv: readonly string[]): boolean {
	return argv.includes("-h") || argv.includes("--help");
}
