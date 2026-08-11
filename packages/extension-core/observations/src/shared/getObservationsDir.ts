import { resolve } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";

/**
 * Resolves the Pi observations storage directory.
 *
 * @returns Absolute observations directory path.
 */
export function getObservationsDir(): string {
	return resolve(getAgentDir(), "observations");
}
