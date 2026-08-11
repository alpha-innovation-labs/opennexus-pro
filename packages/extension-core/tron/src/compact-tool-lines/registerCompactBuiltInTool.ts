import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Container } from "@earendil-works/pi-tui";
import { getRtkExecutionCwd } from "@extensions/rtk/runtime/getRtkExecutionCwd";
import { allToolDefinitions } from "@nexus/pi-platform/tools";
import { rememberActivityInvalidator } from "../activity/rememberActivityInvalidator";
import { renderTranscriptEntry } from "../transcript/renderTranscriptEntry";
import { getBuiltInTools } from "./getBuiltInTools";
import { markCompactWrappedToolDefinition } from "./markCompactWrappedToolDefinition";
import type { BuiltInTools } from "./types";

/**
 * Registers one compact-rendered built-in tool.
 *
 * @param pi Extension API.
 * @param toolName Built-in tool name.
 */
export function registerCompactBuiltInTool(
	pi: ExtensionAPI,
	toolName: keyof BuiltInTools,
): void {
	const original = getBuiltInTools(process.cwd())[toolName];

	(pi.registerTool as (definition: unknown) => void)(
		markCompactWrappedToolDefinition({
			name: toolName,
			label: toolName,
			description: original.description,
			parameters: original.parameters,
			renderShell: "self",
			skipLeadingSpacer: true,
			async execute(
				toolCallId: string,
				params: unknown,
				signal: AbortSignal | undefined,
				onUpdate: never,
				ctx: { cwd?: string },
			) {
				const tools = getBuiltInTools(getRtkExecutionCwd(ctx));
				return tools[toolName].execute(
					toolCallId,
					params as never,
					signal,
					onUpdate,
				);
			},
			renderCall(args: unknown, theme: unknown, context: unknown) {
				rememberActivityInvalidator(context.toolCallId, context.invalidate);
				if (context.isError) return new Container();
				const { renderer } = renderTranscriptEntry(
					{
						role: "tool",
						toolCallId: context.toolCallId,
						toolName,
						args: args as Record<string, unknown>,
						text: "",
					},
					{ theme, expanded: context.expanded },
				);
				return renderer;
			},
			renderResult(
				result: unknown,
				state: unknown,
				theme: unknown,
				context: unknown,
			) {
				rememberActivityInvalidator(context.toolCallId, context.invalidate);
				const builtIn = (allToolDefinitions as unknown)[toolName]?.renderResult;
				// Strip lastComponent so the built-in renderResult doesn't see the Container
				// from compact renderCall, which lacks setText and triggers a crash.
				const cleanContext = {
					...context,
					lastComponent: undefined,
				};
				const { renderer } = renderTranscriptEntry(
					{
						role: "toolResult",
						toolCallId: context.toolCallId,
						toolName,
						result,
						text: "",
					},
					{
						theme,
						expanded: state.expanded,
						resultChildRenderer: builtIn
							? {
									render: (innerWidth: number) =>
										builtIn(result, state, theme, cleanContext).render(
											innerWidth,
										),
									invalidate: () => {
										builtIn(result, state, theme, cleanContext).invalidate?.();
									},
								}
							: undefined,
					},
				);
				return renderer;
			},
		} as unknown),
	);
}
