/**
 * Checks whether a boolean flag is present.
 *
 * @param argv Raw CLI arguments.
 * @param flag Flag name.
 * @returns True when present.
 */
export function hasFlag(argv: readonly string[], flag: string): boolean {
	return argv.includes(flag);
}
