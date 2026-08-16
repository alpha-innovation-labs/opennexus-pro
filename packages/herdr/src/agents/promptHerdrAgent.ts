/**
 * Prompts an agent and waits for it to settle (idle/done/blocked).
 *
 * @param agentName The agent name to prompt.
 * @param promptText The text prompt to send.
 * @param timeoutMs Maximum milliseconds to wait (default 120_000).
 * @returns The agent state after the prompt settles.
 */

import { runHerdr } from "../core/runHerdr.js";

export function promptHerdrAgent(
	agentName: string,
	promptText: string,
	{ timeoutMs = 120_000 }: { timeoutMs?: number } = {},
): Record<string, unknown> {
	console.error(`  → Prompting agent '${agentName}' ...`);

	const result = runHerdr([
		"agent",
		"prompt",
		agentName,
		promptText,
		"--wait",
		"--timeout",
		String(timeoutMs),
	]);
	return result;
}
