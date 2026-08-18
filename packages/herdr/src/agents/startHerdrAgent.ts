/**
 * Starts an agent in a given pane and returns the agent name.
 *
 * @param paneId The pane ID to start the agent in.
 * @param options Optional config: maxWaitSeconds and kind (defaults to 'pi').
 * @returns The agent name.
 */

import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export function startHerdrAgent(
	paneId: string,
	{ maxWaitSeconds = 60, kind = "pi" }: { maxWaitSeconds?: number; kind?: string } = {},
): string {
	// Generate a random lowercase agent name matching [a-z][a-z0-9_-]{0,31}.
	const randomHex = Buffer.from(crypto.getRandomValues(new Uint8Array(4)))
		.toString("hex")
		.slice(0, 4);
	const agentName = `agent-${randomHex}`;

	console.error(
		`  Starting agent '${agentName}' (kind: ${kind}) in pane ${paneId} ...`,
	);

	const result = runHerdr([
		"agent",
		"start",
		agentName,
		"--kind",
		kind,
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

// ─── Async variant (non-blocking, for parallel workflows) ───────────────────

/**
 * Async variant of startHerdrAgent that does not block the event loop.
 * Used by the factory engine for parallel agent execution.
 *
 * @param paneId The pane ID to start the agent in.
 * @param options Optional config: maxWaitSeconds and kind (defaults to 'pi').
 * @returns The agent name.
 */
export async function startHerdrAgentAsync(
	paneId: string,
	{ maxWaitSeconds = 60, kind = "pi" }: { maxWaitSeconds?: number; kind?: string } = {},
): Promise<string> {
	const randomHex = Buffer.from(crypto.getRandomValues(new Uint8Array(4)))
		.toString("hex")
		.slice(0, 4);
	const agentName = `agent-${randomHex}`;

	console.error(
		`  Starting agent '${agentName}' (kind: ${kind}) in pane ${paneId} ...`,
	);

	const result = await runHerdr([
		"agent",
		"start",
		agentName,
		"--kind",
		kind,
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
