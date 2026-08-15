import type { AgentToolResult, ToolDefinition, ToolRenderResultOptions } from "@earendil-works/pi-coding-agent";
import { Container } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { rememberActivityInvalidator } from "../activity/rememberActivityInvalidator";
import { renderTranscriptEntry } from "../transcript/renderTranscriptEntry";
import { markCompactWrappedToolDefinition } from "./markCompactWrappedToolDefinition";

type CompactToolContext = {
	toolCallId: string;
	invalidate(): void;
	isError: boolean;
	expanded?: boolean;
};

type CompactToolResultState = {
	expanded?: boolean;
	isPartial?: boolean;
};

/**
 * Creates a Tron compact-rendered copy of any registered tool definition.
 *
 * @param definition Tool definition to wrap.
 * @returns Compact-rendered tool definition.
 */
export function createCompactToolDefinition(
	definition: ToolDefinition,
): ToolDefinition {
	const wrapped = {
		...definition,
		renderShell: "self" as const,
		renderCall(args: unknown, theme: Theme, context: CompactToolContext) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			if (context.isError) return new Container();
			const { renderer } = renderTranscriptEntry(
				{
					role: "tool",
					toolCallId: context.toolCallId,
					toolName: definition.name,
					args: args as Record<string, unknown>,
					text: "",
				},
				{ theme, expanded: context.expanded },
			);
			return renderer;
		},
		renderResult(
			result: AgentToolResult<unknown>,
			state: CompactToolResultState,
			theme: Theme,
			context: CompactToolContext,
		) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			const { renderer } = renderTranscriptEntry(
				{
					role: "toolResult",
					toolCallId: context.toolCallId,
					toolName: definition.name,
					result: result as never,
					text: "",
				},
				{
					theme,
					expanded: state.expanded ?? false,
					resultChildRenderer: definition.renderResult
						? {
								render: (innerWidth: number) =>
									definition
										.renderResult?.(result, {
											expanded: state.expanded ?? false,
											isPartial: state.isPartial ?? false,
										} as ToolRenderResultOptions, theme, context as never)
										.render(innerWidth) ?? [],
								invalidate: () => {
									definition
										.renderResult?.(result, {
											expanded: state.expanded ?? false,
											isPartial: state.isPartial ?? false,
										} as ToolRenderResultOptions, theme, context as never)
										.invalidate?.();
								},
							}
						: undefined,
				},
			);
			return renderer;
		},
	} as ToolDefinition;
	return markCompactWrappedToolDefinition(wrapped);
}
