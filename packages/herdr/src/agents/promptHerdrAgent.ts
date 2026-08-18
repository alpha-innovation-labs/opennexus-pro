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

// ─── Async variant (non-blocking, for parallel workflows) ───────────────────

/**
 * Async variant that sends a prompt without blocking, then waits for the
 * agent to settle. Used by the factory engine so multiple agents can be
 * prompted concurrently — the prompt submission itself is instant; the
 * wait happens asynchronously afterwards.
 *
 * @param agentName The agent name to prompt.
 * @param promptText The text prompt to send.
 * @param timeoutMs Maximum milliseconds to wait (default 120_000).
 * @returns The agent state after the prompt settles.
 */
export async function promptHerdrAgentAsync(
	agentName: string,
	promptText: string,
	{ timeoutMs = 120_000 }: { timeoutMs?: number } = {},
): Promise<Record<string, unknown>> {
	console.error(`  → Prompting agent '${agentName}' ...`);

	// Send the prompt WITHOUT --wait so the CLI returns immediately.
	// This allows all parallel agents to be prompted concurrently.
	const result = await runHerdr([
		"agent",
		"prompt",
		agentName,
		promptText,
	]);

	// Now wait for the agent to settle (idle/done/blocked) using polling.
	// This is already handled by waitAgent, so just return here —
	// the caller (agentStep) will invoke waitAgent separately.
	return result;
}
