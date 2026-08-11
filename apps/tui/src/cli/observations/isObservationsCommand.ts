/**
 * Checks whether argv requests the observations command namespace.
 *
 * @param argv Raw CLI arguments.
 * @returns True when argv starts with the observations command.
 */
export function isObservationsCommand(argv: readonly string[]): boolean {
	return argv[0] === "observations";
}
