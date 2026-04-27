import assert from "node:assert/strict";
import test from "node:test";
import { TUI, visibleWidth, type Component } from "@mariozechner/pi-tui";
import { SlashMenuModal } from "../../../packages/extensions/src/neo-editor/features/menu/SlashMenuModal.js";
import { createTreeToolCallLines } from "../../../packages/extensions/src/neo-editor/features/menu/tree/createTreeToolCallLines.js";
import { createSlashModal } from "../../../packages/extensions/src/neo-editor/features/promptline/trigger/createSlashModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";
import { VirtualTerminal } from "../../support/terminal/VirtualTerminal.js";

/**
 * Creates a slash modal context with long resumed tree entries.
 *
 * @returns Fake extension context.
 */
function createTreeContext() {
	const longText = "/tree ".repeat(60);
	return createTreeContextWithTree([
		{
			entry: {
				id: "root-user",
				type: "message",
				parentId: null,
				message: { role: "user", content: longText },
			},
			children: [
				{
					entry: {
						id: "assistant-child",
						type: "message",
						parentId: "root-user",
						message: { role: "assistant", content: longText },
					},
					children: [],
				},
			],
		},
	]);
}

/**
 * Creates a slash-modal context with a supplied session tree.
 *
 * @param tree Fake session tree nodes.
 * @returns Fake extension context.
 */
function createTreeContextWithTree(tree: unknown[]) {
	return {
		cwd: process.cwd(),
		sessionManager: {
			/**
			 * Returns fake session tree nodes.
			 *
			 * @returns Fake session tree nodes.
			 */
			getTree() {
				return tree;
			},
		},
		ui: {
			theme: createTestTheme(),
			notify: () => undefined,
		},
	};
}

/**
 * Creates a tree with one user turn, assistant thinking, and a bash tool call.
 *
 * @returns Fake session tree nodes.
 */
function createToolCallTree(): unknown[] {
	return [
		{
			entry: {
				id: "user-1",
				type: "message",
				parentId: null,
				message: { role: "user", content: "Please run checks" },
			},
			children: [
				{
					entry: {
						id: "assistant-1",
						type: "message",
						parentId: "user-1",
						message: {
							role: "assistant",
							content: [
								{ type: "thinking", thinking: "Hidden preface\nAnother skipped line\nI should inspect the project first." },
								{ type: "toolCall", id: "tool-1", name: "bash", arguments: { command: "npm test", timeout: 120 } },
								{ type: "toolCall", id: "tool-2", name: "edit", arguments: { path: "a.ts", oldText: "old", newText: "new" } },
							],
						},
					},
					children: [
						{
							entry: {
								id: "result-1",
								type: "message",
								parentId: "assistant-1",
								message: { role: "toolResult", toolCallId: "tool-1", content: [{ type: "text", text: "npm test failed with TS2345" }] },
							},
							children: [],
						},
						{
							entry: {
								id: "result-2",
								type: "message",
								parentId: "assistant-1",
								message: { role: "toolResult", toolCallId: "tool-2", content: [{ type: "text", text: "Successfully replaced 1 block" }] },
							},
							children: [],
						},
					],
				},
			],
		},
	];
}

/**
 * Creates full-width base content with a marker in the right gutter.
 *
 * @param lineCount Number of rows to render.
 * @returns Test component.
 */
function createMarkedBaseComponent(lineCount: number): Component {
	return {
		/**
		 * Renders base rows that reveal overlay gutter leaks.
		 *
		 * @param width Available terminal width.
		 * @returns Rendered base rows.
		 */
		render(width: number): string[] {
			const marker = "BASE-TAIL";
			return Array.from({ length: lineCount }, () => `${" ".repeat(Math.max(0, width - marker.length - 2))}${marker}`);
		},
		/**
		 * Invalidates cached render state.
		 */
		invalidate(): void {},
	};
}

test("tree modal keeps every rendered row within the terminal width", async () => {
	const modal = new SlashMenuModal(createTreeContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

	await modal.openLevel("tree");
	const view = await renderComponentInVirtualTerminal(() => modal, 122, 24);

	assert.ok(view.every((line) => visibleWidth(line) <= 122));
});

test("tree trigger overlay clears the right gutter over existing chat rows", async () => {
	const terminal = new VirtualTerminal(122, 24);
	const tui = new TUI(terminal, false);
	let close: () => void = () => undefined;
	tui.addChild(createMarkedBaseComponent(24));
	tui.start();
	const { modal, handle } = createSlashModal(
		createTreeContext() as never,
		() => close(),
		() => tui.requestRender(),
		() => undefined,
		() => "medium",
		() => undefined,
		() => undefined,
		tui.showOverlay.bind(tui) as never,
	);
	close = () => handle.hide();
	await modal.openLevel("tree");
	tui.requestRender(true);
	await terminal.waitForRender();
	const view = terminal.getViewport();
	tui.stop();

	const modalRows = view.filter((line) => line.includes("Tree") || line.includes("┌") || line.includes("│") || line.includes("└"));
	assert.ok(modalRows.length > 0);
	assert.ok(modalRows.every((line) => !line.includes("BASE-TAIL")));
	assert.ok(view.every((line) => visibleWidth(line) <= 122));
});

test("tree starts user conversations collapsed without right-side duplicate summaries", async () => {
	const modal = new SlashMenuModal(createTreeContextWithTree(createToolCallTree()) as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

	await modal.openLevel("tree");
	const view = await renderComponentInVirtualTerminal(() => modal, 122, 24);
	const rendered = view.join("\n");

	assert.match(rendered, /▸ ╭/u);
	assert.match(rendered, /│» Please run checks│/u);
	assert.doesNotMatch(rendered, /󰆍 bash/u);
	assert.doesNotMatch(rendered, /I should inspect/u);
	assert.doesNotMatch(rendered, /Please run checks\s{8,}Please run checks/u);
});

test("tree search only starts after slash", async () => {
	const modal = new SlashMenuModal(createTreeContextWithTree(createToolCallTree()) as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

	await modal.openLevel("tree");
	modal.handleInput("P");
	const inactiveView = await renderComponentInVirtualTerminal(() => modal, 122, 24);
	modal.handleInput("/");
	modal.handleInput("P");
	const activeView = await renderComponentInVirtualTerminal(() => modal, 122, 24);

	assert.doesNotMatch(inactiveView.join("\n"), /Search > \/P/u);
	assert.match(activeView.join("\n"), /Search > \/P/u);
});

test("tree l and h expand and collapse tool calls and assistant thinking under a user message", async () => {
	const modal = new SlashMenuModal(createTreeContextWithTree(createToolCallTree()) as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

	await modal.openLevel("tree");
	modal.handleInput("l");
	const expandedView = await renderComponentInVirtualTerminal(() => modal, 122, 24);
	const expanded = expandedView.join("\n");

	assert.match(expanded, /▾ ╭/u);
	assert.match(expanded, /│» Please run checks│/u);
	assert.match(expanded, /┌─+/u);
	assert.match(expanded, /󰧑 I should inspect the project first\./u);
	assert.doesNotMatch(expanded, /Hidden preface/u);
	assert.match(expanded, /│󰆍 bash npm test failed with TS2345\s+timeout=120│.*\n.*│󰏫 edit \+1 -1 Successfully replaced 1 block/u);
	assert.match(expanded, /└─+┘/u);
	assert.doesNotMatch(expanded, /toolResult/u);

	modal.handleInput("h");
	const collapsedView = await renderComponentInVirtualTerminal(() => modal, 122, 24);
	const collapsed = collapsedView.join("\n");

	assert.match(collapsed, /▸ ╭/u);
	assert.match(collapsed, /│» Please run checks│/u);
	assert.doesNotMatch(collapsed, /󰆍 bash/u);
	assert.doesNotMatch(collapsed, /I should inspect/u);
});

test("tree enter focuses selected user and tool call rows", async () => {
	let picked = "";
	const modal = new SlashMenuModal(createTreeContextWithTree(createToolCallTree()) as never, () => "medium", () => undefined, () => undefined, () => undefined, (command) => {
		picked = command;
	});

	await modal.openLevel("tree");
	modal.handleInput("\r");
	assert.equal(picked, "/nexus-tree-select user-1 false");

	picked = "";
	await modal.openLevel("tree");
	modal.handleInput("l");
	await new Promise<void>((resolve) => process.nextTick(resolve));
	modal.handleInput("j");
	modal.handleInput("j");
	modal.handleInput("j");
	modal.handleInput("j");
	modal.handleInput("\r");
	assert.equal(picked, "/nexus-tree-select assistant-1 false");
});

test("tree tool-call lines reuse Tron edit change coloring", () => {
	const lines = createTreeToolCallLines(
		{ type: "toolCall", id: "edit-1", name: "edit", arguments: { path: "a.ts", oldText: "old", newText: "new" } },
		[{ type: "text", text: "Successfully replaced 1 block" }],
		{
			...createTestTheme(),
			fg(color: string, value: string): string {
				return `<${color}>${value}</${color}>`;
			},
		},
		true,
		true,
	);
	const rendered = lines.join("\n");

	assert.match(rendered, /┌─+/u);
	assert.match(rendered, /│.*edit/u);
	assert.match(rendered, /<syntaxType>\+1<\/syntaxType>/u);
	assert.match(rendered, /<error>-1<\/error>/u);
	assert.match(rendered, /└─+┘/u);
});
