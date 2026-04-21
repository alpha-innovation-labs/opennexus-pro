import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@mariozechner/pi-tui";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { applyAssistantMessageToolGrouping } from "../../../src/extensions/tron/activity/applyAssistantMessageToolGrouping.js";
import { noteCollapsedToolExecutionEnd } from "../../../src/extensions/tron/activity/noteCollapsedToolExecutionEnd.js";
import { noteCollapsedToolExecutionStart } from "../../../src/extensions/tron/activity/noteCollapsedToolExecutionStart.js";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.js";
import { setToolGroupCollapseEnabled } from "../../../src/extensions/tron/collapse/state.js";
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
	);
}

test("tron collapses grouped tool calls into one summary row", async () => {
	process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@mariozechner/pi-coding-agent`;
	await initializePiThemes();
	resetAssistantActivityGrouping();
	setToolGroupCollapseEnabled(true);
	applyToolExecutionSpacingPatch();
	installAssistantThinkingStyle();

	const firstMessage = {
		role: "assistant",
		timestamp: 1_000,
		content: [
			{ type: "thinking", thinking: "I need to update the file, then confirm the surrounding usage." },
			{ type: "toolCall", id: "edit-1", name: "edit", arguments: { oldText: "old", newText: "new" } },
			{ type: "toolCall", id: "grep-1", name: "grep", arguments: { path: "src", pattern: "usage", limit: 20 } },
		],
	};
	const secondMessage = {
		role: "assistant",
		timestamp: 4_000,
		content: [
			{ type: "toolCall", id: "write-1", name: "write", arguments: { path: "src/new-file.ts", content: "export const value = 1;" } },
		],
	};

	noteCollapsedToolExecutionStart("edit-1", "edit", { oldText: "old", newText: "new" }, 1_000);
	noteCollapsedToolExecutionEnd("edit-1", 1_400);
	noteCollapsedToolExecutionStart("grep-1", "grep", { path: "src", pattern: "usage", limit: 20 }, 1_500);
	noteCollapsedToolExecutionEnd("grep-1", 1_900);
	noteCollapsedToolExecutionStart("write-1", "write", { path: "src/new-file.ts", content: "export const value = 1;" }, 2_000);
	noteCollapsedToolExecutionEnd("write-1", 4_000);

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();

		applyAssistantMessageToolGrouping(firstMessage);
		root.addChild(new AssistantMessageComponent(firstMessage as never, false));
		root.addChild(createToolExecutionComponent("edit-1", "edit", { oldText: "old", newText: "new" }));
		root.addChild(createToolExecutionComponent("grep-1", "grep", { path: "src", pattern: "usage", limit: 20 }));

		applyAssistantMessageToolGrouping(secondMessage);
		root.addChild(new AssistantMessageComponent(secondMessage as never, false));
		root.addChild(createToolExecutionComponent("write-1", "write", { path: "src/new-file.ts", content: "export const value = 1;" }));

		return root;
	}, 160, 24);

	const plainLines = viewport.map((line) => stripAnsi(line));
	const summaryLine = plainLines.find((line) => line.includes("2 diffs") && line.includes("3 tool calls") && line.includes("3s"));
	const topBorders = plainLines.filter((line) => line.trimStart().startsWith("┌")).length;

	assert.ok(summaryLine);
	assert.equal(topBorders, 1);
	assert.equal(plainLines.some((line) => line.includes("src/new-file.ts")), false);
	assert.equal(plainLines.some((line) => line.includes("pattern: usage")), false);

	setToolGroupCollapseEnabled(false);
	resetAssistantActivityGrouping();
});
