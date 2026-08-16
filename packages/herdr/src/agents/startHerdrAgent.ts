/**
 * Starts an agent in a given pane and returns the agent name.
 * Uses kind "mastracode" directly — no PATH wrapper needed.
 *
 * @param paneId The pane ID to start the agent in.
 * @param maxWaitSeconds Maximum seconds to wait for agent readiness (default 60).
 * @returns The agent name.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function startHerdrAgent(
	paneId: string,
	{ maxWaitSeconds = 60 }: { maxWaitSeconds?: number } = {},
): string {
	// Generate a random lowercase agent name matching [a-z][a-z0-9_-]{0,31}.
	const randomHex = Buffer.from(crypto.getRandomValues(new Uint8Array(4)))
		.toString("hex")
		.slice(0, 4);
	const agentName = `agent-${randomHex}`;

	console.error(
		`  Starting agent '${agentName}' (kind: mastracode) in pane ${paneId} ...`,
	);

	const result = runHerdr([
		"agent",
		"start",
		agentName,
		"--kind",
		"mastracode",
		"--pane",
		paneId,
		"--timeout",
		String(maxWaitSeconds * 1000),
	]);

	const error = (result.error as Record<string, string>)?.code;
	if (error) {
		const message = (result.error as Record<string, string>)?.message ?? error;
		throw new Error(`Failed to start agent: ${message}`);
	}

	const name = drill(result, "result", "agent", "name") ?? agentName;
	console.error(`  ✓ Agent started: ${name}`);

	return name;
}
