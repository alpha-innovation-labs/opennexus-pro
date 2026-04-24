import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@mariozechner/pi-tui";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { applyAssistantMessageToolGrouping } from "../../../src/extensions/tron/activity/applyAssistantMessageToolGrouping.js";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.js";
import { renderSummary } from "../../../src/extensions/tron/compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../../../src/extensions/tron/compact-tool-lines/summarizeArgs.js";
import { installAssistantThinkingStyle } from "../../../src/extensions/tron/thinking/installAssistantThinkingStyle.js";
import { applyToolExecutionSpacingPatch } from "../../../src/pi-internals/applyToolExecutionSpacingPatch.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

/**
 * Removes ANSI escape sequences from rendered terminal lines.
 *
 * @param line Rendered terminal line.
 * @returns Plain visible text.
 */
function stripAnsi(line: string): string {
	return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

/**
 * Creates a compact tool execution component for Tron spacing checks.
 *
 * @param toolCallId Tool call id.
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @returns Tool execution component.
 */
function createToolExecutionComponent(toolCallId: string, toolName: string, args: Record<string, unknown>): ToolExecutionComponent {
	return new ToolExecutionComponent(
		toolName,
		toolCallId,
		args,
		{},
		{
			skipLeadingSpacer: true,
			renderShell: "self",
			renderCall(callArgs: Record<string, unknown>, theme: unknown) {
				return renderSummary(toolCallId, toolName, summarizeArgs(toolName, callArgs), theme, false);
			},
		} as never,
		{ requestRender() {} } as never,
		process.cwd(),
	);
}

test("tron keeps tool-only follow-up messages visually contiguous without regrouping", async () => {
	await initializePiThemes();
	resetAssistantActivityGrouping();
	applyToolExecutionSpacingPatch();
	installAssistantThinkingStyle();

	const firstMessage = {
		role: "assistant",
		content: [
			{ type: "thinking", thinking: "I need to search the docs before I continue." },
			{ type: "toolCall", id: "grep-1", name: "grep", arguments: { path: "docs", pattern: "steer", limit: 20 } },
			{ type: "toolCall", id: "grep-2", name: "grep", arguments: { path: "docs", pattern: "hook", limit: 20 } },
		],
	};
	const secondMessage = {
		role: "assistant",
		content: [
			{ type: "toolCall", id: "grep-3", name: "grep", arguments: { path: "docs/extensions.md", pattern: "followUp", limit: 20 } },
			{ type: "toolCall", id: "grep-4", name: "grep", arguments: { path: "docs/extensions.md", pattern: "CustomMessageEntry", limit: 20 } },
		],
	};

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();

		applyAssistantMessageToolGrouping(firstMessage);
		root.addChild(new AssistantMessageComponent(firstMessage as never, true));
		root.addChild(createToolExecutionComponent("grep-1", "grep", { path: "docs", pattern: "steer", limit: 20 }));
		root.addChild(createToolExecutionComponent("grep-2", "grep", { path: "docs", pattern: "hook", limit: 20 }));

		applyAssistantMessageToolGrouping(secondMessage);
		root.addChild(new AssistantMessageComponent(secondMessage as never, true));
		root.addChild(createToolExecutionComponent("grep-3", "grep", { path: "docs/extensions.md", pattern: "followUp", limit: 20 }));
		root.addChild(createToolExecutionComponent("grep-4", "grep", { path: "docs/extensions.md", pattern: "CustomMessageEntry", limit: 20 }));

		return root;
	}, 160, 24);

	const plainLines = viewport.map((line) => stripAnsi(line));
	const topBorders = plainLines.filter((line) => line.trimStart().startsWith("┌")).length;
	const grep3Index = plainLines.findIndex((line) => line.includes("followUp"));

	assert.equal(topBorders, 1);
	assert.notEqual(grep3Index, -1);
	assert.equal(plainLines[grep3Index - 1]?.includes("┌"), false);
	assert.notEqual(plainLines[grep3Index - 1]?.trim(), "");
	resetAssistantActivityGrouping();
});
