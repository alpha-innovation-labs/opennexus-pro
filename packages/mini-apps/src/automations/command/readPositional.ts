/**
 * Reads the positional argument after a command prefix.
 *
 * @param argv Raw command args.
 * @param index Positional index.
 * @returns Positional value, or undefined.
 */
export function readPositional(argv: readonly string[], index: number): string | undefined {
	const values = argv.filter((arg) => !arg.startsWith("-"));
	return values[index];
}
