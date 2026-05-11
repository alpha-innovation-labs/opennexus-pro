import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Container } from "@earendil-works/pi-tui";
import { allToolDefinitions } from "@nexus/pi-platform/tools.js";
import { getRtkExecutionCwd } from "@nexus/extensions-pro/rtk/runtime/getRtkExecutionCwd.js";
import { rememberActivityInvalidator } from "../activity/rememberActivityInvalidator.ts";
import { BorderedToolResult } from "./BorderedToolResult.ts";
import { FailedToolCallResult } from "./FailedToolCallResult.ts";
import { getBuiltInTools } from "./getBuiltInTools.ts";
import { getToolErrorText } from "./getToolErrorText.ts";
import { markCompactWrappedToolDefinition } from "./markCompactWrappedToolDefinition.ts";
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

	(pi.registerTool as (definition: unknown) => void)(markCompactWrappedToolDefinition({
		name: toolName,
		label: toolName,
		description: original.description,
		parameters: original.parameters,
		renderShell: "self",
		skipLeadingSpacer: true,
		async execute(toolCallId: string, params: unknown, signal: AbortSignal | undefined, onUpdate: never, ctx: { cwd?: string }) {
			const tools = getBuiltInTools(getRtkExecutionCwd(ctx));
			return tools[toolName].execute(toolCallId, params as never, signal, onUpdate);
		},
		renderCall(args: unknown, theme: any, context: any) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			if (context.isError) return new Container();
			return renderSummary(context.toolCallId, toolName, summarizeArgs(toolName, args), theme, Boolean((context.state as any).hasVisibleResult));
		},
		renderResult(result: any, state: any, theme: any, context: any) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			if (context.isError) {
				(context.state as any).hasVisibleResult = false;
				return new FailedToolCallResult(context.toolCallId, toolName, getToolErrorText(result), theme);
			}
			(context.state as any).hasVisibleResult = Boolean(state.expanded && Array.isArray(result?.content) && result.content.length > 0);
			if (!state.expanded) return new Container();
			const builtIn = (allToolDefinitions as any)[toolName]?.renderResult;
			if (builtIn) {
				return new BorderedToolResult(context.toolCallId, builtIn(result, state, theme, context as any), theme);
			}
			return renderCompactResult(context.toolCallId, result, true, theme);
		},
	}));
}
