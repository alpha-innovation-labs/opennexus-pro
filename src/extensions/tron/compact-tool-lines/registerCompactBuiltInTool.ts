import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Container } from "@mariozechner/pi-tui";
import { allToolDefinitions } from "../../../pi-internals/tools.js";
import { rememberActivityInvalidator } from "../activity/rememberActivityInvalidator.ts";
import { toolActivityKey } from "../activity/toolActivityKey.ts";
import { isToolGroupCollapseEnabled } from "../collapse/state.ts";
import { rememberCollapsedToolCall } from "../activity/rememberCollapsedToolCall.ts";
import { shouldHideToolCallForCollapsedGroup } from "../activity/shouldHideToolCallForCollapsedGroup.ts";
import { BorderedToolResult } from "./BorderedToolResult.ts";
import { CollapsedToolGroupCall } from "./CollapsedToolGroupCall.ts";
import { getBuiltInTools } from "./getBuiltInTools.ts";
import { renderCompactResult } from "./renderCompactResult.ts";
import { renderSummary } from "./renderSummary.ts";
import { summarizeArgs } from "./summarizeArgs.ts";
import type { BuiltInTools } from "./types.ts";

/**
 * Registers one compact-rendered built-in tool.
 *
 * @param pi Extension API.
 * @param toolName Built-in tool name.
 */
export function registerCompactBuiltInTool(pi: ExtensionAPI, toolName: keyof BuiltInTools): void {
	const original = getBuiltInTools(process.cwd())[toolName];

	pi.registerTool({
		name: toolName,
		label: toolName,
		description: original.description,
		parameters: original.parameters,
		renderShell: "self",
		skipLeadingSpacer: true,
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const tools = getBuiltInTools(ctx.cwd);
			return tools[toolName].execute(toolCallId, params, signal, onUpdate);
		},
		renderCall(args, theme, context) {
			rememberActivityInvalidator(toolActivityKey(context.toolCallId), context.invalidate);
			rememberCollapsedToolCall(context.toolCallId, toolName, args as Record<string, unknown>);
			if (isToolGroupCollapseEnabled()) {
				if (shouldHideToolCallForCollapsedGroup(context.toolCallId)) return new Container();
				return new CollapsedToolGroupCall(context.toolCallId, theme);
			}
			return renderSummary(context.toolCallId, toolName, summarizeArgs(toolName, args), theme, Boolean((context.state as any).hasVisibleResult));
		},
		renderResult(result, state, theme, context) {
			rememberActivityInvalidator(toolActivityKey(context.toolCallId), context.invalidate);
			if (isToolGroupCollapseEnabled()) return new Container();
			(context.state as any).hasVisibleResult = Boolean(state.expanded && Array.isArray(result?.content) && result.content.length > 0);
			if (!state.expanded) return new Container();
			const builtIn = (allToolDefinitions as any)[toolName]?.renderResult;
			if (builtIn) {
				return new BorderedToolResult(context.toolCallId, builtIn(result, state, theme, context as any), theme);
			}
			return renderCompactResult(context.toolCallId, result, true, theme);
		},
	});
}
