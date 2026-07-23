/**
 * Checks whether argv contains a boolean flag.
 *
 * @param argv Raw command args.
 * @param flag Flag name.
 * @returns True when flag is present.
 */
export function hasFlag(argv: readonly string[], flag: string): boolean {
	return argv.includes(flag);
}
