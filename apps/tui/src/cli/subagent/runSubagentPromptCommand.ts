import { promptHerdrAgent } from "@nexus/herdr";

/**
 * Runs `nexus subagent prompt <session-id> "<text>"`: sends a prompt to an
 * agent and waits for the response before returning.
 *
 * @param sessionId  The agent session name (e.g. "agent-abc1").
 * @param text       The prompt text to send.
 * @returns Process exit code.
 */
export async function runSubagentPromptCommand(
	sessionId: string,
	text: string,
	timeoutMs?: number,
): Promise<number> {
	try {
		console.error(`Prompting agent '${sessionId}': ${text}`);

		const result = promptHerdrAgent(sessionId, text, { timeoutMs });
		const output = JSON.stringify(result);

		if (output.startsWith("{")) {
			console.log(output);
		} else if (output) {
			console.log(output);
		}

		return 0;
	} catch (err) {
		const message = (err as Error).message ?? `prompt failed: status=1`;
		console.error(message);
		return 1;
	}
}
