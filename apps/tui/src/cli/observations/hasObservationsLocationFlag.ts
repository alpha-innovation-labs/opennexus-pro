const OBSERVATIONS_LOCATION_FLAG = "--observations-location";

/**
 * Checks whether the CLI should print the observations storage location.
 *
 * @param argv Raw process arguments.
 * @returns True when the observations location flag is present.
 */
export function hasObservationsLocationFlag(argv: string[]): boolean {
	return argv.includes(OBSERVATIONS_LOCATION_FLAG);
}
