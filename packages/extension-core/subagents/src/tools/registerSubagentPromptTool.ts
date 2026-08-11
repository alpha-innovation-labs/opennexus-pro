import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { promptHerdrAgent } from "@nexus/herdr";

/**
 * Registers the `subagent_prompt` tool — sends a prompt to an agent
 * and waits for the response before returning.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentPromptTool(pi: ExtensionAPI): void {
	pi.registerTool(
		defineTool({
			name: "subagent_prompt",
			label: "Subagent Prompt",
			description:
				"Send a prompt to a subagent and wait for the response before returning.",
			promptSnippet: "Send a prompt to a subagent and wait for the response",
			parameters: Type.Object({
				sessionId: Type.String({
					description: "The agent session name (e.g. 'agent-abc1').",
				}),
				text: Type.String({ description: "The prompt text to send." }),
				timeoutMs: Type.Optional(
					Type.Number({
						description: "Optional timeout in milliseconds (default 120000).",
					}),
				),
			}),
			async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
				const timeout = params.timeoutMs ?? 120_000;

				try {
					const result = promptHerdrAgent(params.sessionId, params.text, {
						timeoutMs: timeout,
					});
					const output = JSON.stringify(result);

					return {
						content: [{ type: "text", text: output || "No output" }],
						details: { sessionId: params.sessionId },
					};
				} catch (err) {
					const message = (err as Error).message ?? `Prompt failed: status=1`;
					return {
						content: [{ type: "text", text: `Prompt failed: status=1` }],
						details: { error: message.slice(0, 500) },
					};
				}
			},
		}),
	);
}
