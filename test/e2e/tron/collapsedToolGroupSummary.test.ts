import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@mariozechner/pi-tui";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { applyAssistantMessageToolGrouping } from "../../../src/extensions/tron/activity/applyAssistantMessageToolGrouping.js";
import { noteCollapsedToolExecutionEnd } from "../../../src/extensions/tron/activity/noteCollapsedToolExecutionEnd.js";
import { noteCollapsedToolExecutionStart } from "../../../src/extensions/tron/activity/noteCollapsedToolExecutionStart.js";
import { rememberCollapsedToolCall } from "../../../src/extensions/tron/activity/rememberCollapsedToolCall.js";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.js";
import { shouldHideToolCallForCollapsedGroup } from "../../../src/extensions/tron/activity/shouldHideToolCallForCollapsedGroup.js";
import { isToolGroupCollapseEnabled, setToolGroupCollapseEnabled } from "../../../src/extensions/tron/collapse/state.js";
import { CollapsedToolGroupCall } from "../../../src/extensions/tron/compact-tool-lines/CollapsedToolGroupCall.js";
import { renderSummary } from "../../../src/extensions/tron/compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../../../src/extensions/tron/compact-tool-lines/summarizeArgs.js";
import { finishAssistantMessageTiming, resetAssistantMessageTimings, startAssistantMessageTiming } from "../../../src/extensions/tron/thinking/assistantMessageTimingState.js";
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
				rememberCollapsedToolCall(toolCallId, toolName, callArgs);
				if (isToolGroupCollapseEnabled()) {
					if (shouldHideToolCallForCollapsedGroup(toolCallId)) return new Container();
					return new CollapsedToolGroupCall(toolCallId);
				}
				return renderSummary(toolCallId, toolName, summarizeArgs(toolName, callArgs), theme, false);
			},
		} as never,
		{ requestRender() {} } as never,
	);
}

test("tron collapse mode hides the original thinking box and shows one bordered summary row", async () => {
	process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@mariozechner/pi-coding-agent`;
	await initializePiThemes();
	resetAssistantActivityGrouping();
	resetAssistantMessageTimings();
	setToolGroupCollapseEnabled(true);
	applyToolExecutionSpacingPatch();
	installAssistantThinkingStyle();

	const firstMessage = {
		role: "assistant",
		timestamp: 1_000,
		content: [
			{ type: "thinking", thinking: "I need to make some code changes while adhering to the concise final template.\nIt matters a lot.\n**Considering code updates**" },
			{ type: "toolCall", id: "edit-1", name: "edit", arguments: { oldText: "before", newText: "after\nnext" } },
			{ type: "toolCall", id: "grep-1", name: "grep", arguments: { path: "src", pattern: "usage", limit: 20 } },
		],
	};
	const secondMessage = {
		role: "assistant",
		timestamp: 4_000,
		content: [{ type: "thinking", thinking: "Now I can explain the changes." }],
	};

	startAssistantMessageTiming(1_000);
	finishAssistantMessageTiming(1_000, "0s");
	startAssistantMessageTiming(4_000);
	finishAssistantMessageTiming(4_000, "0s");

	noteCollapsedToolExecutionStart("edit-1", "edit", { oldText: "before", newText: "after\nnext" }, 1_000);
	noteCollapsedToolExecutionEnd("edit-1", 1_400);
	noteCollapsedToolExecutionStart("grep-1", "grep", { path: "src", pattern: "usage", limit: 20 }, 1_500);
	noteCollapsedToolExecutionEnd("grep-1", 1_900);

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();
		applyAssistantMessageToolGrouping(firstMessage);
		applyAssistantMessageToolGrouping(secondMessage);
		root.addChild(new AssistantMessageComponent(firstMessage as never, true));
		root.addChild(createToolExecutionComponent("edit-1", "edit", { oldText: "before", newText: "after\nnext" }));
		root.addChild(createToolExecutionComponent("grep-1", "grep", { path: "src", pattern: "usage", limit: 20 }));
		root.addChild(new AssistantMessageComponent(secondMessage as never, true));
		return root;
	}, 160, 24);

	const plainLines = viewport.map((line) => stripAnsi(line)).filter((line) => line.trim().length > 0);
	const summaryIndex = plainLines.findIndex((line) => line.includes("**Considering code updates**"));

	assert.notEqual(summaryIndex, -1);
	assert.equal(plainLines[summaryIndex]?.includes("󰧑") && plainLines[summaryIndex]?.includes("󰘧 2") && plainLines[summaryIndex]?.includes("3s") && plainLines[summaryIndex]?.includes("+2 -1"), true);
	assert.equal(plainLines[summaryIndex - 1]?.trimStart().startsWith("┌"), true);
	assert.equal(plainLines[summaryIndex + 1]?.trimStart().startsWith("└"), true);
	assert.equal(plainLines.some((line) => line.includes("I need to make some code changes while adhering")), false);
	assert.equal(plainLines.some((line) => line.includes("+0 -0")), false);

	setToolGroupCollapseEnabled(false);
	resetAssistantActivityGrouping();
	resetAssistantMessageTimings();
});

test("tron collapse mode keeps borders and wraps expanded thinking without overflow", async () => {
	process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@mariozechner/pi-coding-agent`;
	await initializePiThemes();
	resetAssistantActivityGrouping();
	resetAssistantMessageTimings();
	setToolGroupCollapseEnabled(true);
	applyToolExecutionSpacingPatch();
	installAssistantThinkingStyle();

	const firstMessage = {
		role: "assistant",
		timestamp: 1_000,
		content: [
			{ type: "thinking", thinking: "This is a much longer thinking block that should wrap onto multiple lines while keeping the text column aligned for every rendered line in compact mode." },
			{ type: "toolCall", id: "edit-wrap", name: "edit", arguments: { oldText: "a", newText: "b\nc\nd\ne" } },
		],
	};
	const secondMessage = {
		role: "assistant",
		timestamp: 96_000,
		content: [{ type: "thinking", thinking: "done" }],
	};

	startAssistantMessageTiming(1_000);
	finishAssistantMessageTiming(1_000, "0s");
	startAssistantMessageTiming(96_000);
	finishAssistantMessageTiming(96_000, "0s");

	applyAssistantMessageToolGrouping(firstMessage);
	applyAssistantMessageToolGrouping(secondMessage);
	noteCollapsedToolExecutionStart("edit-wrap", "edit", { oldText: "a", newText: "b\nc\nd\ne" }, 1_000);
	noteCollapsedToolExecutionEnd("edit-wrap", 1_200);

	const viewportExpanded = await renderComponentInVirtualTerminal(() => {
		const root = new Container();
		root.addChild(new AssistantMessageComponent(firstMessage as never, false));
		root.addChild(createToolExecutionComponent("edit-wrap", "edit", { oldText: "a", newText: "b\nc\nd\ne" }));
		root.addChild(new AssistantMessageComponent(secondMessage as never, false));
		return root;
	}, 90, 24);

	const plainExpandedLines = viewportExpanded.map((line) => stripAnsi(line)).filter((line) => line.trim().length > 0);
	const summaryIndex = plainExpandedLines.findIndex((line) => line.includes("This is a much longer"));
	const wrappedIndex = plainExpandedLines.findIndex((line) => line.includes("rendered line in compact mode."));
	assert.notEqual(summaryIndex, -1);
	assert.notEqual(wrappedIndex, -1);
	assert.equal(plainExpandedLines[summaryIndex - 1]?.trimStart().startsWith("┌"), true);
	assert.equal(plainExpandedLines[wrappedIndex + 1]?.trimStart().startsWith("└"), true);
	assert.equal(plainExpandedLines[summaryIndex]?.trimEnd().endsWith("│"), true);
	assert.equal(plainExpandedLines[wrappedIndex]?.trimEnd().endsWith("│"), true);
	assert.equal(plainExpandedLines[summaryIndex]?.includes("This is a much longer"), true);
	assert.equal(plainExpandedLines[wrappedIndex]?.includes("aligned for every rendered line in compact mode."), true);

	setToolGroupCollapseEnabled(false);
	resetAssistantActivityGrouping();
	resetAssistantMessageTimings();
});

test("tron collapse mode merges consecutive thinking summaries into one shared box", async () => {
	process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@mariozechner/pi-coding-agent`;
	await initializePiThemes();
	resetAssistantActivityGrouping();
	resetAssistantMessageTimings();
	setToolGroupCollapseEnabled(true);
	applyToolExecutionSpacingPatch();
	installAssistantThinkingStyle();

	const firstMessage = {
		role: "assistant",
		timestamp: 1_000,
		content: [
			{ type: "thinking", thinking: "one\ntwo\nfirst summary" },
			{ type: "toolCall", id: "edit-a", name: "edit", arguments: { oldText: "a", newText: "b" } },
		],
	};
	const secondMessage = {
		role: "assistant",
		timestamp: 4_000,
		content: [
			{ type: "thinking", thinking: "one\ntwo\nsecond summary" },
			{ type: "toolCall", id: "write-b", name: "write", arguments: { path: "src/file.ts", content: "x\ny" } },
		],
	};
	const thirdMessage = {
		role: "assistant",
		timestamp: 7_000,
		content: [{ type: "thinking", thinking: "done" }],
	};

	startAssistantMessageTiming(1_000);
	finishAssistantMessageTiming(1_000, "0s");
	startAssistantMessageTiming(4_000);
	finishAssistantMessageTiming(4_000, "0s");
	startAssistantMessageTiming(7_000);
	finishAssistantMessageTiming(7_000, "0s");

	noteCollapsedToolExecutionStart("edit-a", "edit", { oldText: "a", newText: "b" }, 1_000);
	noteCollapsedToolExecutionEnd("edit-a", 1_200);
	noteCollapsedToolExecutionStart("write-b", "write", { path: "src/file.ts", content: "x\ny" }, 4_000);
	noteCollapsedToolExecutionEnd("write-b", 4_200);

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();
		applyAssistantMessageToolGrouping(firstMessage);
		applyAssistantMessageToolGrouping(secondMessage);
		applyAssistantMessageToolGrouping(thirdMessage);
		root.addChild(new AssistantMessageComponent(firstMessage as never, true));
		root.addChild(createToolExecutionComponent("edit-a", "edit", { oldText: "a", newText: "b" }));
		root.addChild(new AssistantMessageComponent(secondMessage as never, true));
		root.addChild(createToolExecutionComponent("write-b", "write", { path: "src/file.ts", content: "x\ny" }));
		root.addChild(new AssistantMessageComponent(thirdMessage as never, true));
		return root;
	}, 160, 24);

	const plainLines = viewport.map((line) => stripAnsi(line)).filter((line) => line.trim().length > 0);
	const firstSummaryIndex = plainLines.findIndex((line) => line.includes("first summary"));
	const secondSummaryIndex = plainLines.findIndex((line) => line.includes("second summary"));

	assert.notEqual(firstSummaryIndex, -1);
	assert.notEqual(secondSummaryIndex, -1);
	assert.equal(plainLines[firstSummaryIndex - 1]?.trimStart().startsWith("┌"), true);
	assert.equal(plainLines[firstSummaryIndex + 1]?.includes("second summary"), true);
	assert.equal(plainLines[secondSummaryIndex + 1]?.trimStart().startsWith("└"), true);
	assert.equal(plainLines.some((line) => line.includes("󰧑 · 󰘧 1 · 3s ·")), true);

	setToolGroupCollapseEnabled(false);
	resetAssistantActivityGrouping();
	resetAssistantMessageTimings();
});
