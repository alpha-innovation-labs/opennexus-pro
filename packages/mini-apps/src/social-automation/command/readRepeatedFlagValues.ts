/**
 * Reads every value passed for a repeated CLI flag.
 *
 * @param argv Raw CLI arguments.
 * @param flag Repeated flag name.
 * @returns Flag values in call order.
 */
export function readRepeatedFlagValues(argv: readonly string[], flag: string): string[] {
	const values: string[] = [];
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === flag && argv[index + 1]) values.push(argv[index + 1]);
	}
	return values;
}
