import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@mariozechner/pi-tui";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { applyAssistantMessageToolGrouping } from "../../../src/extensions/tron/activity/applyAssistantMessageToolGrouping.js";
import { rememberCollapsedToolCall } from "../../../src/extensions/tron/activity/rememberCollapsedToolCall.js";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.js";
import { shouldHideToolCallForCollapsedGroup } from "../../../src/extensions/tron/activity/shouldHideToolCallForCollapsedGroup.js";
import { isToolGroupCollapseEnabled, setToolGroupCollapseEnabled } from "../../../src/extensions/tron/collapse/state.js";
import { CollapsedToolGroupCall } from "../../../src/extensions/tron/compact-tool-lines/CollapsedToolGroupCall.js";
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
 * Creates a compact tool execution component for collapse-toggle checks.
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

test("tron ignores collapse toggles while grouping stays disabled", async () => {
	process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@mariozechner/pi-coding-agent`;
	await initializePiThemes();
	resetAssistantActivityGrouping();
	setToolGroupCollapseEnabled(true);
	applyToolExecutionSpacingPatch();
	installAssistantThinkingStyle();

	assert.equal(isToolGroupCollapseEnabled(), false);

	const firstMessage = {
		role: "assistant",
		timestamp: 1_000,
		content: [
			{ type: "thinking", thinking: "line one\nline two\n**Considering code updates**" },
			{ type: "toolCall", id: "edit-1", name: "edit", arguments: { oldText: "before", newText: "after\nnext" } },
			{ type: "toolCall", id: "grep-1", name: "grep", arguments: { path: "src", pattern: "usage", limit: 20 } },
		],
	};
	const secondMessage = {
		role: "assistant",
		timestamp: 4_000,
		content: [{ type: "thinking", thinking: "Done." }],
	};

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

	const plainLines = viewport.map((line) => stripAnsi(line));
	assert.equal(plainLines.some((line) => line.includes("**Considering code updates**")), true);
	assert.equal(plainLines.some((line) => line.includes("edit") && line.includes("before")), true);
	assert.equal(plainLines.some((line) => line.includes("grep") && line.includes("pattern=usage")), true);
	assert.equal(plainLines.some((line) => line.includes("󰘧 2")), false);
	assert.equal(plainLines.some((line) => line.includes("3s")), false);

	setToolGroupCollapseEnabled(false);
	resetAssistantActivityGrouping();
});
