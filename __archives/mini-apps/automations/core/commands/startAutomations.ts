import { ensureAutomationRootDir } from "../paths/ensureAutomationRootDir.js";
import { spawnAutomationDaemonProcess } from "../process/spawnAutomationDaemonProcess.js";
import { waitForAutomationDaemonReady } from "../process/waitForAutomationDaemonReady.js";
import { getAutomationDaemonStatus } from "../state/getAutomationDaemonStatus.js";
import type { AutomationDaemonStatus } from "../state/types.js";

/** Result from starting the automations daemon. */
export type StartAutomationsResult = { started: boolean; status: AutomationDaemonStatus };

/**
 * Starts the automations daemon if needed.
 *
 * @returns Start result and status.
 */
export async function startAutomations(): Promise<StartAutomationsResult> {
	const currentStatus = getAutomationDaemonStatus();
	if (currentStatus.running) return { started: false, status: currentStatus };
	ensureAutomationRootDir();
	spawnAutomationDaemonProcess();
	return { started: true, status: await waitForAutomationDaemonReady(5000) };
}
