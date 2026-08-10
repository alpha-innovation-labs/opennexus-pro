import { writeFileSync } from "node:fs";
import { isStartupProfileEnabled } from "./isStartupProfileEnabled";
import { startupProfileLogPath } from "./startupProfileLogPath";

/**
 * Clears the startup-profile log for the current profiled run.
 */
export function clearStartupProfileLog(): void {
	if (!isStartupProfileEnabled()) return;
	writeFileSync(startupProfileLogPath, "", "utf8");
}
