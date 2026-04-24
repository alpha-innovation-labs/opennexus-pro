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

test("tron empty thinking-only live turns keep standalone tool rows contiguous", async () => {
	await initializePiThemes();
	resetAssistantActivityGrouping();
	applyToolExecutionSpacingPatch();
	installAssistantThinkingStyle();

	const firstMessage = {
		role: "assistant",
		content: [{ type: "toolCall", id: "edit-1", name: "edit", arguments: { path: "a.ts", edits: [] } }],
	};
	const emptyThinkingMessage = {
		role: "assistant",
		content: [{ type: "thinking", thinking: "" }],
	};
	const secondMessage = {
		role: "assistant",
		content: [{ type: "toolCall", id: "edit-2", name: "edit", arguments: { path: "b.ts", edits: [] } }],
	};

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();

		applyAssistantMessageToolGrouping(firstMessage);
		root.addChild(new AssistantMessageComponent(firstMessage as never, true));
		root.addChild(createToolExecutionComponent("edit-1", "edit", { path: "a.ts", edits: [] }));

		applyAssistantMessageToolGrouping(emptyThinkingMessage);
		root.addChild(new AssistantMessageComponent(emptyThinkingMessage as never, true));

		applyAssistantMessageToolGrouping(secondMessage);
		root.addChild(new AssistantMessageComponent(secondMessage as never, true));
		root.addChild(createToolExecutionComponent("edit-2", "edit", { path: "b.ts", edits: [] }));
		return root;
	}, 120, 20);

	const plainLines = viewport.map((line) => stripAnsi(line)).filter((line) => line.trim().length > 0);
	const firstToolIndex = plainLines.findIndex((line) => line.includes("edit") && line.includes("a.ts"));
	const secondToolIndex = plainLines.findIndex((line) => line.includes("edit") && line.includes("b.ts"));

	assert.notEqual(firstToolIndex, -1);
	assert.notEqual(secondToolIndex, -1);
	assert.equal(secondToolIndex, firstToolIndex + 1);
	resetAssistantActivityGrouping();
});
