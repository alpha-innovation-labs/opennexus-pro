/**
 * Checks whether argv requests observation printing.
 *
 * @param argv Raw CLI arguments.
 * @returns True when the observations flag is present.
 */
export function hasObservationsFlag(argv: string[]): boolean {
	return argv.some(
		(arg) => arg === "--observations" || arg.startsWith("--observations="),
	);
}
