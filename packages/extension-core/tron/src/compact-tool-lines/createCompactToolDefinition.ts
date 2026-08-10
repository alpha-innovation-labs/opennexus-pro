import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import { Container } from "@earendil-works/pi-tui";
import { rememberActivityInvalidator } from "../activity/rememberActivityInvalidator.ts";
import { renderTranscriptEntry } from "../transcript/renderTranscriptEntry.js";
import { markCompactWrappedToolDefinition } from "./markCompactWrappedToolDefinition.js";

/**
 * Creates a Tron compact-rendered copy of any registered tool definition.
 *
 * @param definition Tool definition to wrap.
 * @returns Compact-rendered tool definition.
 */
export function createCompactToolDefinition(definition: ToolDefinition<any, any, any>): ToolDefinition<any, any, any> {
	const wrapped = {
		...definition,
		renderShell: "self" as const,
		renderCall(args: unknown, theme: any, context: any) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			if (context.isError) return new Container();
			const { renderer } = renderTranscriptEntry(
				{ role: "tool", toolCallId: context.toolCallId, toolName: definition.name, args: args as Record<string, unknown> },
				{ theme, expanded: context.expanded },
			);
			return renderer;
		},
		renderResult(result: any, state: any, theme: any, context: any) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			const { renderer } = renderTranscriptEntry(
				{ role: "toolResult", toolCallId: context.toolCallId, toolName: definition.name, result },
				{
					theme,
					expanded: state.expanded,
					resultChildRenderer: definition.renderResult
						? {
							render: (innerWidth: number) => definition.renderResult!(result, state, theme, context).render(innerWidth),
							invalidate: () => definition.renderResult!(result, state, theme, context).invalidate?.(),
						}
						: undefined,
				},
			);
			return renderer;
		},
	};
	return markCompactWrappedToolDefinition(wrapped);
}
