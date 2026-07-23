import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getAutomationStatePath } from "../paths/getAutomationStatePath.js";
import type { AutomationDaemonState } from "./types.js";

/**
 * Writes daemon state to disk.
 *
 * @param state Daemon state payload.
 */
export function writeAutomationDaemonState(state: AutomationDaemonState): void {
	const path = getAutomationStatePath();
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
