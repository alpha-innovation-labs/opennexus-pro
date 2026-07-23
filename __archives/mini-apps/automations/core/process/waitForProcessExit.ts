import { setTimeout as delay } from "node:timers/promises";
import { isProcessAlive } from "./isProcessAlive.js";

/**
 * Waits until a process exits.
 *
 * @param pid Process id.
 * @param timeoutMs Maximum wait time.
 * @returns True when the process exits before timeout.
 */
export async function waitForProcessExit(pid: number, timeoutMs: number): Promise<boolean> {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (!isProcessAlive(pid)) return true;
		await delay(100);
	}
	return !isProcessAlive(pid);
}
