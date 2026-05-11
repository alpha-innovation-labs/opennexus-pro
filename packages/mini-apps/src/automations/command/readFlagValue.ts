/**
 * Reads a CLI flag value from argv.
 *
 * @param argv Raw command args.
 * @param flag Flag name including dashes.
 * @returns Flag value, or undefined.
 */
export function readFlagValue(argv: readonly string[], flag: string): string | undefined {
	const equalsPrefix = `${flag}=`;
	const equalsValue = argv.find((arg) => arg.startsWith(equalsPrefix));
	if (equalsValue) return equalsValue.slice(equalsPrefix.length);
	const index = argv.indexOf(flag);
	return index >= 0 ? argv[index + 1] : undefined;
}
