import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { renderPromptlineEditor } from "../../../packages/extensions/src/neo-editor/features/promptline/render/renderPromptlineEditor.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum context required to render the promptline editor.
 *
 * @param entries Active branch entries.
 * @returns Extension context stub.
 */
function createContext(entries: Array<{ type: string }>) {
	return {
		cwd: process.cwd(),
		model: undefined,
		ui: { theme: createTestTheme() },
		sessionManager: { getBranch: () => entries },
	};
}

test("renderPromptlineEditor centers a half-width promptline for empty conversations", () => {
	const lines = renderPromptlineEditor(80, () => ["╭──╮", "│  │", "╰──╯"], (value) => value, createTestTheme() as never, createContext([]) as never, () => "high");

	assert.ok(lines[0]?.startsWith("                    ╭"));
	assert.equal(visibleWidth(lines[0] ?? ""), 60);
});

test("renderPromptlineEditor uses full-width promptline after conversation messages", () => {
	const lines = renderPromptlineEditor(80, () => ["╭──╮", "│  │", "╰──╯"], (value) => value, createTestTheme() as never, createContext([{ type: "message" }]) as never, () => "high");

	assert.ok(lines[0]?.startsWith("╭"));
	assert.equal(visibleWidth(lines[0] ?? ""), 80);
});
