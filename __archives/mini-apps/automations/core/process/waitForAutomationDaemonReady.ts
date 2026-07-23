import { setTimeout as delay } from "node:timers/promises";
import { getAutomationDaemonStatus } from "../state/getAutomationDaemonStatus.js";
import type { AutomationDaemonStatus } from "../state/types.js";

/**
 * Waits until the automation daemon writes a live status.
 *
 * @param timeoutMs Maximum wait time.
 * @returns Latest daemon status.
 */
export async function waitForAutomationDaemonReady(timeoutMs: number): Promise<AutomationDaemonStatus> {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		const status = getAutomationDaemonStatus();
		if (status.running) return status;
		await delay(100);
	}
	return getAutomationDaemonStatus();
}
