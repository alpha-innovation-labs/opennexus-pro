import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";

/**
 * Returns the persisted feature-state path for the bundled FFF extension.
 *
 * @returns Absolute feature-state file path.
 */
export function getFeatureStatePath(): string {
	return join(getAgentDir(), "extensions", "fff.json");
}
