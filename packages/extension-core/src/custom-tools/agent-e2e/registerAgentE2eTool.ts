import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { spawnSync } from "node:child_process";

/**
 * Register the agent_e2e tool with the Pi extension API.
 *
 * This is a proxy for `just agent-e2e <subcommand> [args]` that allows
 * the agent to create, interact with, and tear down Herdr e2e test
 * environments directly from tool calls.
 *
 * @param pi Pi extension API.
 */
export function registerAgentE2eTool(pi: ExtensionAPI): void {
	pi.registerTool(
		defineTool({
			name: "agent_e2e",
			label: "Agent E2E",
			description:
				"Create and interact with Herdr e2e test environments via CLI. " +
				"Use when the user asks to set up a test workspace, start an agent, " +
				"send prompts, read output, or send keys. Triggers on: " +
				'"e2e test", "herdr setup", "start agent", "herdr agent", ' +
				'"agent-e2e", "test workspace".',
			promptSnippet:
				"Create and interact with Herdr e2e test environments via CLI. Use when the user asks to set up a test workspace, start an agent, send prompts, read output, or send keys. Triggers on: \"e2e test\", \"herdr setup\", \"start agent\", \"herdr agent\", \"agent-e2e\", \"test workspace\".",
			promptGuidelines: [
				"Use agent_e2e when the user asks to set up a test workspace, start an agent, send prompts, read output, or send keys.",
				"Subcommands: setup, start, prompt, send-keys, read, close, full, help.",
				"Use `prompt` to write content (sends text instructions). `send-keys` only sends keypresses (Enter, Esc, Ctrl+c).",
				"Use `--agentName` in `setup` when you need a predictable agent name across commands.",
				"Always `close` when done to clean up resources.",
				"If agent start fails with 'not an available shell', you are not inside a real Herdr session.",
			],
			parameters: Type.Object({
				subcommand: Type.String({
					description:
						"The subcommand to run: setup, start, prompt, send-keys, read, close, full, or help.",
				}),
				agentName: Type.Optional(
					Type.String({
						description:
							"Agent name (used by start, prompt, send-keys, read). Set via --agentName in setup for predictability.",
					})
				),
				prompt: Type.Optional(
					Type.String({
						description: "The text prompt to send to an agent (used by 'prompt' and 'full' subcommands).",
					})
				),
				workspaceId: Type.Optional(
					Type.String({
						description:
							"Workspace ID to close (used by 'close' subcommand, e.g. 'w42').",
					})
				),
				paneId: Type.Optional(
					Type.String({
						description:
							"Pane ID to start an agent in (used by 'start' subcommand, e.g. 'w42:p1').",
					})
				),
				keys: Type.Optional(
					Type.Array(
						Type.String(),
						{
							description:
								"Key presses to send (used by 'send-keys' subcommand, e.g. ['Enter', 'a b c']).",
						}
					)
				),
				lines: Type.Optional(
					Type.Number({
						description: "Number of lines to read from agent output (default: 50).",
					})
				),
				label: Type.Optional(
					Type.String({
						description: "Custom workspace label (used by 'setup' and 'full' subcommands).",
					})
				),
				maxWait: Type.Optional(
					Type.Number({
						description: "Maximum wait time in seconds (used by 'setup' and 'start' subcommands).",
					})
				),
				timeout: Type.Optional(
					Type.Number({
						description: "Timeout in milliseconds (used by 'prompt' and 'full' subcommands).",
					})
				),
			}),
			async execute(_toolCallId, params, signal, _onUpdate, ctx) {
				try {
					const { subcommand } = params;
					const args: string[] = [subcommand];

					// Build subcommand-specific arguments.
					switch (subcommand) {
						case "setup": {
							if (params.label) args.push("--label", params.label);
							if (params.agentName) args.push("--agentName", params.agentName);
							if (params.maxWait) args.push("--maxWait", String(params.maxWait));
							break;
						}
						case "start": {
							if (!params.paneId) {
								return {
									content: [
										{
											type: "text" as const,
											text: "Error: 'start' subcommand requires a <paneId> argument.",
										},
									],
								};
							}
							args.push(params.paneId);
							if (params.maxWait) args.push("--maxWait", String(params.maxWait));
							break;
						}
						case "prompt": {
							if (!params.agentName) {
								return {
									content: [
										{
											type: "text" as const,
											text: "Error: 'prompt' subcommand requires <agentName> and '<prompt>' arguments.",
										},
									],
								};
							}
							args.push(params.agentName, params.prompt ?? "");
							if (params.timeout) args.push("--timeout", String(params.timeout));
							break;
						}
						case "send-keys": {
							if (!params.agentName || !params.keys || params.keys.length === 0) {
								return {
									content: [
										{
											type: "text" as const,
											text: "Error: 'send-keys' subcommand requires <agentName> and <keys...> arguments.",
										},
									],
								};
							}
							args.push(params.agentName, ...params.keys);
							break;
						}
						case "read": {
							if (!params.agentName) {
								return {
									content: [
										{
											type: "text" as const,
											text: "Error: 'read' subcommand requires <agentName> argument.",
										},
									],
								};
							}
							args.push(params.agentName);
							if (params.lines) args.push("--lines", String(params.lines));
							break;
						}
						case "close": {
							if (!params.workspaceId) {
								return {
									content: [
										{
											type: "text" as const,
											text: "Error: 'close' subcommand requires a <workspaceId> argument.",
										},
									],
								};
							}
							args.push(params.workspaceId);
							break;
						}
						case "full": {
							if (params.label) args.push("--label", params.label);
							if (params.maxWait) args.push("--maxWait", String(params.maxWait));
							if (params.prompt) args.push("--prompt", params.prompt);
							if (params.timeout) args.push("--timeout", String(params.timeout));
							break;
						}
						case "help":
						default:
							// No extra args needed for help.
							break;
					}

					// Execute `just agent-e2e <subcommand> [args...]`.
					const result = spawnSync("just", ["agent-e2e", ...args], {
						encoding: "utf-8",
						timeout: 300_000,
						signal,
						cwd: ctx.cwd,
					});

					const stdout = (result.stdout?.toString() ?? "").trim();
					const stderr = (result.stderr?.toString() ?? "").trim();

					if (result.error) {
						return {
							content: [
								{
									type: "text" as const,
									text: `Execution error: ${result.error.message}`,
								},
							],
						};
					}

					// Output may go to stdout (for 'read' raw text) or stderr (for status messages).
					const output = stdout || stderr;

					if (subcommand === "help") {
						return {
							content: [
								{
									type: "text" as const,
									text: output || "No help output available.",
								},
							],
						};
					}

					return {
						content: [
							{
								type: "text" as const,
								text: output || "Command completed with no output.",
							},
						],
					};
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					return {
						content: [
							{
								type: "text" as const,
								text: `Unexpected error: ${message}`,
							},
						],
					};
				}
			},
		})
	);
}
