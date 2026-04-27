import { getAgentDir } from "@mariozechner/pi-coding-agent";
import { resolve } from "node:path";

/**
 * Resolves the Pi observations storage directory.
 *
 * @returns Absolute observations directory path.
 */
export function getObservationsDir(): string {
	return resolve(getAgentDir(), "observations");
}
