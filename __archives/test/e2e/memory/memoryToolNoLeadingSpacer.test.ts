import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@earendil-works/pi-tui";
import { ToolExecutionComponent } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { registerAddTweetMemoryTool } from "../../../packages/mini-apps/src/memory/tools/registerAddTweetMemoryTool.js";
import { applyToolExecutionSpacingPatch } from "../../../packages/pi-platform/src/applyToolExecutionSpacingPatch.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

/**
 * Removes ANSI escape sequences from a rendered terminal line.
 *
 * @param line Rendered terminal line.
 * @returns Plain visible text.
 */
function stripAnsi(line: string): string {
	return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

/**
 * Captures the registered memory_add_tweet tool definition.
 *
 * @returns Registered tool definition.
 */
function captureAddTweetToolDefinition(): Record<string, unknown> {
	let toolDefinition: Record<string, unknown> | undefined;
	registerAddTweetMemoryTool({
		registerTool(definition: Record<string, unknown>) {
			toolDefinition = definition;
		},
	} as never);
	if (!toolDefinition) throw new Error("memory_add_tweet was not registered");
	return toolDefinition;
}

test("memory tools render without Pi's extra leading spacer", async () => {
	await initializePiThemes();
	applyToolExecutionSpacingPatch();
	const toolDefinition = captureAddTweetToolDefinition();

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();
		root.addChild(new ToolExecutionComponent(
			"memory_add_tweet",
			"memory-1",
			{ projectName: "nexus", title: "Cursor SDK" },
			{},
			toolDefinition as never,
			{ requestRender() {} } as never,
			process.cwd(),
		));
		return root;
	}, 120, 8);

	const plainLines = viewport.map((line) => stripAnsi(line));
	const toolLineIndex = plainLines.findIndex((line) => line.includes("memory_add_tweet"));

	assert.notEqual(toolLineIndex, -1);
	assert.equal(toolLineIndex, 0);
});
