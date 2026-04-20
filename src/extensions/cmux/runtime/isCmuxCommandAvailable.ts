import { spawnSync } from "node:child_process";
import { getCmuxExecutablePath } from "./getCmuxExecutablePath.js";

/**
 * Checks whether the cmux CLI is available on the current system.
 *
 * @returns True when the cmux executable can be invoked.
 */
export function isCmuxCommandAvailable(): boolean {
	const result = spawnSync(getCmuxExecutablePath(), ["version"], {
		encoding: "utf8",
		stdio: "ignore",
		timeout: 1000,
	});
	return !result.error && result.status === 0;
}
