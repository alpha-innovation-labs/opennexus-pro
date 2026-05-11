import { existsSync, readFileSync } from "node:fs";
import { getAutomationStatePath } from "../paths/getAutomationStatePath.js";
import type { AutomationDaemonState } from "./types.js";

/**
 * Reads daemon state from disk.
 *
 * @returns Daemon state, or null when unavailable.
 */
export function readAutomationDaemonState(): AutomationDaemonState | null {
	const path = getAutomationStatePath();
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, "utf8")) as AutomationDaemonState;
	} catch {
		return null;
	}
}
