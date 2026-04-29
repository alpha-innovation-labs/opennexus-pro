/**
 * Checks whether argv requests Pi print mode.
 *
 * @param argv Raw command-line arguments.
 * @returns True when print mode is requested with -p or --print.
 */
export function hasPrintModeFlag(argv: string[]): boolean {
	return argv.includes("-p") || argv.includes("--print");
}
