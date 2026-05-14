import { getObservationsDir } from "@nexus/extensions-pro/observations/shared/getObservationsDir.js";

/**
 * Prints the active observations storage directory.
 */
export function printObservationsLocation(): void {
	console.log(getObservationsDir());
}
