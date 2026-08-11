import * as crypto from "node:crypto";
import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { splitPaneRight, startForegroundAgent } from "@nexus/herdr";

/**
 * Registers the `subagent_start` tool — splits the current pane right and
 * starts a `mastracode` agent in the new pane via `herdr`.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentStartTool(pi: ExtensionAPI): void {
	pi.registerTool(
		defineTool({
			name: "subagent_start",
			label: "Subagent Start",
			description:
				"Split the current pane right and start a mastracode subagent agent. If --session is provided, uses that name; otherwise generates a random one.",
			promptSnippet:
				"Split the current pane right and start a mastracode subagent agent",
			parameters: Type.Object({
				session: Type.Optional(
					Type.String({
						description:
							"Optional session name; defaults to 'agent-<random-hex>'.",
					}),
				),
				skills: Type.Optional(
					Type.Array(Type.String(), {
						description:
							"Optional list of skill names to preload (each becomes --skill <name>; all agents start with --no-skills).",
					}),
				),
			}),
			async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
				const sessionName = params.session
					? params.session
					: `agent-${crypto.randomBytes(4).toString("hex").slice(0, 4)}`;

				try {
					const paneId = splitPaneRight();

					// Wait for split pane to be ready
					await new Promise((resolve) => setTimeout(resolve, 2000));

					const status = startForegroundAgent(sessionName, paneId, {
						skills: params.skills,
						stdio: "pipe",
						blocking: false,
					});

					return {
						content: [
							{
								type: "text",
								text: `Agent started: session=${sessionName}, pane=${paneId}`,
							},
						],
						details: { sessionName, paneId, status },
					};
				} catch (err) {
					const message = (err as Error).message ?? `Split failed: status=1`;
					return {
						content: [{ type: "text", text: `Split failed: status=1` }],
						details: { error: message.slice(0, 2000) },
					};
				}
			},
		}),
	);
}
