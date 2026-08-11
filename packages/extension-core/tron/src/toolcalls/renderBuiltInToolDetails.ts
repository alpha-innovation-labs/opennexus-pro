import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { allToolDefinitions } from "@nexus/pi-platform/tools";
import { formatToolCallDetails } from "./formatToolCallDetails";
import { toPlainTextLines } from "./toPlainTextLines";
import type { ToolCallInfo } from "./types";

/**
 * Renders built-in call and result components when available.
 *
 * @param toolCall Tool call info.
 * @param theme Pi UI theme.
 * @param width Available detail width.
 * @returns Rendered detail lines.
 */
export function renderBuiltInToolDetails(
	toolCall: ToolCallInfo,
	theme: ExtensionCommandContext["ui"]["theme"],
	width: number,
): string[] {
	const definition = (allToolDefinitions as Record<string, unknown>)[
		toolCall.toolName
	];
	if (!definition?.renderCall && !definition?.renderResult)
		return formatToolCallDetails(toolCall);
	const state: Record<string, unknown> = {};
	const baseContext = {
		args: toolCall.arguments,
		state,
		lastComponent: undefined,
		invalidate: () => {},
		toolCallId: toolCall.toolCallId,
		cwd: process.cwd(),
		executionStarted: true,
		argsComplete: true,
		isPartial: false,
		expanded: true,
		showImages: false,
		isError: toolCall.result?.isError ?? false,
	};
	const lines = [
		`call id: ${toolCall.toolCallId}`,
		`assistant message: #${toolCall.assistantIndex}`,
		...(toolCall.assistantPreview
			? [`context: ${toolCall.assistantPreview}`]
			: []),
		...(toolCall.assistantThinking
			? ["", "Thinking", ...toPlainTextLines(toolCall.assistantThinking)]
			: []),
		"",
	];
	if (definition.renderCall) {
		const callComponent = definition.renderCall(
			toolCall.arguments,
			theme,
			baseContext,
		);
		lines.push("Call");
		lines.push(...callComponent.render(width));
		lines.push("");
	}
	if (!toolCall.result) {
		lines.push("Result", "No tool result found on the current branch.");
		return lines;
	}
	if (definition.renderResult) {
		const resultContext =
			toolCall.toolName === "edit"
				? {
						...baseContext,
						state: {},
						lastComponent: undefined,
						isError: toolCall.result.isError,
					}
				: {
						...baseContext,
						lastComponent: undefined,
						isError: toolCall.result.isError,
					};
		const resultComponent = definition.renderResult(
			{
				content: toolCall.result.content ?? [],
				details: toolCall.result.details,
				isError: toolCall.result.isError,
			},
			{ expanded: true, isPartial: false },
			theme,
			resultContext,
		);
		lines.push("Result");
		lines.push(...resultComponent.render(width));
		return lines;
	}
	return formatToolCallDetails(toolCall);
}
