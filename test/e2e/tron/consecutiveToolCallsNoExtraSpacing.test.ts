import assert from "node:assert/strict";
import test from "node:test";
import { Container, Text } from "@earendil-works/pi-tui";
import { ToolExecutionComponent } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { BorderedToolResult } from "../../../packages/extension-core/src/tron/compact-tool-lines/BorderedToolResult.js";
import { renderSummary } from "../../../packages/extension-core/src/tron/compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../../../packages/extension-core/src/tron/compact-tool-lines/summarizeArgs.js";
import { applyToolExecutionSpacingPatch } from "../../../packages/pi-platform/src/applyToolExecutionSpacingPatch.js";
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
 * Creates a real Tron-style tool execution component.
 *
 * Uses the production `renderSummary` for the call and a `BorderedToolResult` for
 * the result. The call's `hasAttachedResult` is driven by `context.expanded` (the
 * source-level fix in the Tron renderer), not by `state.hasVisibleResult`, so the
 * first render after a result is set is correct without any prototype patch.
 *
 * @param toolCallId Tool call id.
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @returns Tool execution component.
 */
function createRealTronTool(
	toolCallId: string,
	toolName: string,
	args: Record<string, unknown>,
): ToolExecutionComponent {
	return new ToolExecutionComponent(
		toolName,
		toolCallId,
		args,
		{},
		{
			skipLeadingSpacer: true,
			renderShell: "self",
			renderCall(callArgs: Record<string, unknown>, theme: unknown, context: { expanded?: boolean; isError?: boolean }) {
				// Mirrors the production Tron renderer: skip the call's bottom border
				// when the tool is expanded (the result will visually attach below it).
				if (context.isError) return new Container();
				return renderSummary(
					toolCallId,
					toolName,
					summarizeArgs(toolName, callArgs),
					theme,
					Boolean(context.expanded),
				);
			},
			renderResult(
				result: { content?: Array<{ type: string; text?: string }>; isError?: boolean },
				state: { expanded: boolean },
				theme: unknown,
				context: { toolCallId: string; isError?: boolean },
			) {
				if (context.isError) {
					return new Container();
				}
				if (!state.expanded) return new Container();
				const text = result.content?.map((c) => c.text ?? "").join("\n") ?? "";
				return new BorderedToolResult(context.toolCallId, new Text(text, 0, 0), theme);
			},
		} as never,
		{ requestRender() {} } as never,
		process.cwd(),
	);
}

/**
 * Executes a tool synchronously and returns the rendered viewport.
 *
 * @param toolCallId Tool call id.
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @param resultText Text returned by the tool.
 * @returns Plain (ANSI-stripped) viewport lines.
 */
async function renderExecutedTool(
	toolCallId: string,
	toolName: string,
	args: Record<string, unknown>,
	resultText: string,
): Promise<string[]> {
	const tool = createRealTronTool(toolCallId, toolName, args);
	tool.setArgsComplete();
	tool.markExecutionStarted();
	tool.setExpanded(true);
	tool.updateResult({ content: [{ type: "text", text: resultText }], isError: false });

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();
		root.addChild(tool);
		return root;
	}, 100, 20);

	return viewport.map((line) => stripAnsi(line));
}

test("tron tool call summary has no bottom border when result follows immediately", async () => {
	await initializePiThemes();
	applyToolExecutionSpacingPatch();

	const lines = await renderExecutedTool("bash-1", "bash", { command: "echo test" }, "test output");

	// With the source fix in the Tron renderer (driving `hasAttachedResult` from
	// `context.expanded`), the call skips its bottom border as soon as the tool is
	// expanded. The result, drawn by `BorderedToolResult`, supplies the closing
	// border — so the merged tool block is: top border, call content, result
	// content, bottom border. No extra row from a duplicate call bottom border.
	const bottomBorderLines = lines.filter((line) => line.includes("└"));
	assert.equal(
		bottomBorderLines.length,
		1,
		`Expected exactly 1 bottom border (result only), found ${bottomBorderLines.length}. Lines: ${JSON.stringify(lines)}`,
	);

	const topBorderLines = lines.filter((line) => line.includes("┌"));
	assert.equal(
		topBorderLines.length,
		1,
		`Expected exactly 1 top border (call only), found ${topBorderLines.length}. Lines: ${JSON.stringify(lines)}`,
	);
});

test("tron two consecutive tool calls render with single shared border stack", async () => {
	await initializePiThemes();
	applyToolExecutionSpacingPatch();

	const tool1 = createRealTronTool("bash-1", "bash", { command: "echo one" });
	const tool2 = createRealTronTool("bash-2", "bash", { command: "echo two" });

	tool1.setArgsComplete();
	tool1.markExecutionStarted();
	tool1.setExpanded(true);
	tool1.updateResult({ content: [{ type: "text", text: "one" }], isError: false });

	tool2.setArgsComplete();
	tool2.markExecutionStarted();
	tool2.setExpanded(true);
	tool2.updateResult({ content: [{ type: "text", text: "two" }], isError: false });

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();
		root.addChild(tool1);
		root.addChild(tool2);
		return root;
	}, 100, 30);

	const lines = viewport.map((line) => stripAnsi(line));

	// Each tool should produce 1 top border + 1 call line + 1 result line + 1
	// bottom border = 4 lines per tool. With the timing bug, each call would
	// also draw its own bottom border, producing 5 lines per tool (10 total).
	const tool1EchoIndex = lines.findIndex((line) => line.includes("echo one"));
	const tool2EchoIndex = lines.findIndex((line, i) => i > tool1EchoIndex && line.includes("echo two"));
	assert.notEqual(tool1EchoIndex, -1, "tool 1 echo line should be present");
	assert.notEqual(tool2EchoIndex, -1, "tool 2 echo line should be present");

	const bottomBorderLines = lines.filter((line) => line.includes("└"));
	assert.equal(
		bottomBorderLines.length,
		2,
		`Expected exactly 2 bottom borders (one per tool result), found ${bottomBorderLines.length}. Lines: ${JSON.stringify(lines)}`,
	);

	const topBorderLines = lines.filter((line) => line.includes("┌"));
	assert.equal(
		topBorderLines.length,
		2,
		`Expected exactly 2 top borders (one per tool call), found ${topBorderLines.length}. Lines: ${JSON.stringify(lines)}`,
	);
});

test("tron tool call keeps its bottom border when collapsed (no result visible)", async () => {
	await initializePiThemes();
	applyToolExecutionSpacingPatch();

	// Tool that is NOT expanded: the result (if any) is collapsed away, so the
	// call must still draw its own bottom border to close the box.
	const tool = createRealTronTool("bash-pending", "bash", { command: "sleep 5" });
	tool.setArgsComplete();
	tool.markExecutionStarted();
	// Deliberately do not setExpanded or updateResult — the call should be a
	// standalone closed box.

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();
		root.addChild(tool);
		return root;
	}, 100, 20);

	const lines = viewport.map((line) => stripAnsi(line));

	const topBorderLines = lines.filter((line) => line.includes("┌"));
	const bottomBorderLines = lines.filter((line) => line.includes("└"));
	assert.equal(topBorderLines.length, 1, "Should have 1 top border for the call");
	assert.equal(bottomBorderLines.length, 1, "Should have 1 bottom border when the tool is not expanded");
});

test("tron source fix removes the need for the prototype state patch", async () => {
	// This test asserts the source-level contract: the Tron renderer derives
	// `hasAttachedResult` from `context.expanded` directly, with no dependency
	// on a property set by `renderResult` during the same `updateDisplay` pass.
	// Concretely: on the very first `updateDisplay` after a result is set
	// (where any patch would be most needed), the call should already see the
	// expanded state via `context.expanded` and skip its bottom border.
	await initializePiThemes();
	applyToolExecutionSpacingPatch();

	const tool = createRealTronTool("bash-1", "bash", { command: "echo test" });
	tool.setArgsComplete();
	tool.markExecutionStarted();

	// Manually drive the first render path: set result first, then expanded.
	// This is the exact ordering that exposed the timing bug in the old code
	// (renderCall ran before renderResult and saw the stale `state.hasVisibleResult`).
	tool.updateResult({ content: [{ type: "text", text: "ok" }], isError: false });
	tool.setExpanded(true);

	const viewport = await renderComponentInVirtualTerminal(() => {
		const root = new Container();
		root.addChild(tool);
		return root;
	}, 100, 20);

	const lines = viewport.map((line) => stripAnsi(line));
	const bottomBorderLines = lines.filter((line) => line.includes("└"));
	assert.equal(
		bottomBorderLines.length,
		1,
		`First-render timing: expected 1 bottom border (result only), found ${bottomBorderLines.length}. Lines: ${JSON.stringify(lines)}`,
	);
});
