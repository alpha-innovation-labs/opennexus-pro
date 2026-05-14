import { resolve } from "node:path";
import { getObservationsDir } from "./getObservationsDir.js";

/**
 * Resolves the persisted observation prompt override path.
 *
 * @returns Absolute prompt override path.
 */
export function getObservationPromptOverridePath(): string {
	return resolve(getObservationsDir(), "observation-prompt.md");
}
