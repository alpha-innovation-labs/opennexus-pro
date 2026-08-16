/**
 * Sends text to an agent via `herdr agent send-text`, then sends Enter
 * to submit it.
 *
 * @param agentName The target agent name (e.g. "agent-abc1").
 * @param text      The text to send.
 */

import { runHerdr } from "../core/runHerdr.js";

export function sendTextToAgent(agentName: string, text: string): void {
	runHerdr(["agent", "send-text", agentName, text], { timeoutMs: 10_000 });
	runHerdr(["agent", "send-keys", agentName, "Enter"], { timeoutMs: 10_000 });
}
