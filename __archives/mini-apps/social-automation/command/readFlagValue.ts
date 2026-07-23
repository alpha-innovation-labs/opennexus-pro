/**
 * Reads a single CLI flag value.
 *
 * @param argv Raw CLI arguments.
 * @param flag Flag name.
 * @returns Flag value when present.
 */
export function readFlagValue(argv: readonly string[], flag: string): string | undefined {
	const index = argv.indexOf(flag);
	return index >= 0 ? argv[index + 1] : undefined;
}
