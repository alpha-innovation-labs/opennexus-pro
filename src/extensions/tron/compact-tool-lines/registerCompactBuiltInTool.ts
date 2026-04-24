import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Container } from "@mariozechner/pi-tui";
import { allToolDefinitions } from "../../../pi-internals/tools.js";
import { getRtkExecutionCwd } from "../../rtk/runtime/getRtkExecutionCwd.js";
import { rememberActivityInvalidator } from "../activity/rememberActivityInvalidator.ts";
import { BorderedToolResult } from "./BorderedToolResult.ts";
import { FailedToolCallResult } from "./FailedToolCallResult.ts";
import { getBuiltInTools } from "./getBuiltInTools.ts";
import { getToolErrorText } from "./getToolErrorText.ts";
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
			const tools = getBuiltInTools(getRtkExecutionCwd(ctx));
			return tools[toolName].execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			if (context.isError) return new Container();
			return renderSummary(context.toolCallId, toolName, summarizeArgs(toolName, args), theme, Boolean((context.state as any).hasVisibleResult));
		},
		renderResult(result, state, theme, context) {
			rememberActivityInvalidator(context.toolCallId, context.invalidate);
			if (context.isError) {
				(context.state as any).hasVisibleResult = false;
				return new FailedToolCallResult(toolName, getToolErrorText(result), theme);
			}
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
