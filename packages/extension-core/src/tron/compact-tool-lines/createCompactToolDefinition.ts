import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import { Container } from "@earendil-works/pi-tui";
import { rememberActivityInvalidator } from "../activity/rememberActivityInvalidator.js";
import { BorderedToolResult } from "./BorderedToolResult.js";
import { FailedToolCallResult } from "./FailedToolCallResult.js";
import { getToolErrorText } from "./getToolErrorText.js";
import { markCompactWrappedToolDefinition } from "./markCompactWrappedToolDefinition.js";
import { renderCompactResult } from "./renderCompactResult.js";
import { renderSummary } from "./renderSummary.js";
import { summarizeArgs } from "./summarizeArgs.js";

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
			return renderSummary(context.toolCallId, definition.name, summarizeArgs(definition.name, args), theme, Boolean((context.state as any).hasVisibleResult));
		},
		renderResult(result: any, state: any, theme: any, context: any) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			if (context.isError) {
				(context.state as any).hasVisibleResult = false;
				return new FailedToolCallResult(context.toolCallId, definition.name, getToolErrorText(result), theme);
			}
			(context.state as any).hasVisibleResult = Boolean(state.expanded && Array.isArray(result?.content) && result.content.length > 0);
			if (!state.expanded) return new Container();
			if (definition.renderResult) {
				return new BorderedToolResult(context.toolCallId, definition.renderResult(result, state, theme, context), theme);
			}
			return renderCompactResult(context.toolCallId, result, true, theme);
		},
	};
	return markCompactWrappedToolDefinition(wrapped);
}
