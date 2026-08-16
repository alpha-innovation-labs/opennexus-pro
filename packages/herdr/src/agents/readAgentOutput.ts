/**
 * Reads text output from an agent pane.
 * Mirrors `herdr agent read <agentName>`.
 *
 * @param agentName The agent name to read output from.
 * @param options Optional lines and source parameters.
 * @returns Object containing the raw output text.
 */

import { runHerdr } from "../core/runHerdr.js";

export interface ReadAgentOutputResult {
	_raw: string;
}

export function readAgentOutput(
	agentName: string,
	{ lines = 50, source = "recent" }: { lines?: number; source?: "recent" | "visible" | "recent-unwrapped" } = {},
): ReadAgentOutputResult {
	const result = runHerdr(["agent", "read", agentName, "--lines", String(lines), "--source", source]);

	// `herdr agent read` outputs agent text as raw text (not JSON).
	const raw = (result as { _raw?: string })._raw ?? "";

	return { _raw: raw };
}
