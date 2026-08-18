/**
 * Waits for an agent to reach a specific status.
 * Mirrors `herdr agent wait <agentName> --status <status> --timeout <ms>`.
 *
 * Uses non-blocking async polling so multiple agents can wait concurrently
 * without blocking the Node.js event loop.
 *
 * @param agentName The agent name to wait for.
 * @param options Status to wait for and timeout in milliseconds.
 * @returns The agent state after reaching the target status.
 */

import { runHerdr } from "../core/runHerdr.js";

export type AgentWaitStatus = "idle" | "working" | "blocked" | "done";

export interface WaitAgentOptions {
	status: AgentWaitStatus;
	timeoutMs?: number;
}

export async function waitAgent(
	agentName: string,
	{ status, timeoutMs = 60_000 }: WaitAgentOptions,
): Promise<Record<string, unknown>> {
	const start = Date.now();

	while (Date.now() - start < timeoutMs) {
		const result = runHerdr(["agent", "get", agentName]);
		const currentStatus = (result as { status?: string }).status;

		if (currentStatus === status) {
			return result;
		}

		await new Promise((r) => setTimeout(r, 500));
	}

	throw new Error(`agent ${agentName}: timed out waiting for ${status}`);
}
