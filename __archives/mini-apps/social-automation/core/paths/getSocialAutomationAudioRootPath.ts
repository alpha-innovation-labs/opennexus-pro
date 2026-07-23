import { join } from "node:path";
import { getSocialAutomationRootPath } from "./getSocialAutomationRootPath.js";

/**
 * Resolves the audio artifact root directory.
 *
 * @param overridePath Optional CLI override path.
 * @returns Absolute or caller-provided audio root path.
 */
export function getSocialAutomationAudioRootPath(overridePath?: string): string {
	return overridePath ?? join(getSocialAutomationRootPath(), "audio");
}
