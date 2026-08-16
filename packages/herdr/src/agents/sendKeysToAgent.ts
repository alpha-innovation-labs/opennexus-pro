/**
 * Sends key presses to an agent via `herdr agent send-keys`.
 *
 * @param agentName The target agent name.
 * @param keys      Key presses (e.g. "Enter", "Esc").
 */

import { runHerdr } from "../core/runHerdr.js";

export function sendKeysToAgent(agentName: string, ...keys: string[]): void {
	runHerdr(["agent", "send-keys", agentName, ...keys], { timeoutMs: 10_000 });
}
