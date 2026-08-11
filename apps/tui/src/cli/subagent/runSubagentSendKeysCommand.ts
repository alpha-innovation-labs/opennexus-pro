import { sendKeysToAgent } from "@nexus/herdr";

/**
 * Sends key presses to an agent via `herdr agent send-keys`.
 *
 * @param agentName The target agent name (e.g. "agent-abc1").
 * @param keys      Key presses (e.g. "Enter", "Esc").
 * @returns Process exit code.
 */
export async function runSubagentSendKeysCommand(
	agentName: string,
	keys: string[],
): Promise<number> {
	try {
		console.error(`Sending keys to agent ${agentName}: ${keys.join(", ")}`);
		sendKeysToAgent(agentName, ...keys);
		console.error("Keys sent.");
		return 0;
	} catch (err) {
		const message = (err as Error).message ?? `send-keys failed: status=1`;
		console.error(message);
		return 1;
	}
}
