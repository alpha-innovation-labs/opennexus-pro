/**
 * Stops/kills an agent.
 * Mirrors `herdr agent stop <agentName>`.
 *
 * @param agentName The agent name to stop.
 * @returns Process exit status (0 = success).
 */

import { runHerdr } from "../core/runHerdr.js";

export function stopAgent(agentName: string): number {
	const result = runHerdr(["agent", "stop", agentName]);

	const jsonResult = result as Record<string, unknown>;
	const exitCode = jsonResult.exit_status as number | undefined;

	return exitCode ?? 0;
}
