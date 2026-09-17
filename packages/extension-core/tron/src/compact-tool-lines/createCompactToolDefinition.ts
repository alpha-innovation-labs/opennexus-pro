import type { AgentToolResult, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { Container, type Component, type TuiMouseEvent } from "@earendil-works/pi-tui";
import { dispatchMouseEvent } from "@earendil-works/pi-tui/dist/tui.js";
import { getToolOutputScrollState } from "./ToolOutputViewport";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { rememberActivityInvalidator } from "../activity/rememberActivityInvalidator";
import { renderTranscriptEntry } from "../transcript/renderTranscriptEntry";
import { isAgentProgressTool } from "./AgentProgressCall";
import { markCompactWrappedToolDefinition } from "./markCompactWrappedToolDefinition";

type CompactToolContext = {
	toolCallId: string;
	invalidate(): void;
	isError: boolean;
	expanded?: boolean;
	args?: Record<string, unknown>;
	state?: object;
	toolOutputViewport?: boolean;
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
			if (context.isError && !isAgentProgressTool(definition.name)) return new Container();
			const { renderer } = renderTranscriptEntry(
				{
					role: "tool",
					toolCallId: context.toolCallId,
					toolName: definition.name,
					args: args as Record<string, unknown>,
					text: "",
				},
				{
					theme, expanded: context.expanded,
					callChildRenderer: isAgentProgressTool(definition.name) && definition.renderCall
						? definition.renderCall(args as never, new Proxy(theme, {
							// Tintin's badge may restore Pi's tool-shell background; Tron
							// owns that shell, so keep badges but not a second row tint.
							get: (target, key) => key === "getBgAnsi"
								? () => "" : Reflect.get(target, key),
						}), { ...context, lastComponent: undefined } as never)
						: undefined,
				},
			);
			return renderer;
		},
		renderResult(
			result: AgentToolResult<any>,
			state: CompactToolResultState,
			theme: Theme,
			context: CompactToolContext,
		) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			// The AgentToolResult payload carries no error flag; pi tracks it on the
			// render context. Inject it so the toolResult renderer can show the error.
			const entryResult = { ...result, isError: context.isError };
			// The upstream renderer must see its own previous component, not our
			// border wrapper. Read it each paint so background workflow state stays live.
			let child: Component | undefined;
			const liveChild = definition.renderResult
				? {
					render: (width: number) => {
						child = definition.renderResult!(result, {
							expanded: state.expanded ?? false,
							isPartial: state.isPartial ?? false,
						}, theme, { ...context, lastComponent: child } as never);
						return child.render(width);
					},
					invalidate: () => child?.invalidate(),
					handleMouse: (event: TuiMouseEvent) => child ? dispatchMouseEvent(child, event) : undefined,
				}
				: undefined;
			const { renderer } = renderTranscriptEntry(
				{
					role: "toolResult",
					toolCallId: context.toolCallId,
					toolName: definition.name,
					args: context.args,
					result: entryResult as never,
					text: "",
				},
				{
					theme,
					expanded: state.expanded ?? false,
					toolOutputScrollState: context.toolOutputViewport === false ? undefined : getToolOutputScrollState(context.state),
					resultChildRenderer: liveChild,
				},
			);
			return renderer;
		},
	} as ToolDefinition;
	return markCompactWrappedToolDefinition(wrapped);
}
