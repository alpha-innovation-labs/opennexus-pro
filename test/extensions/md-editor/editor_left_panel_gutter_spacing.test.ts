import assert from "node:assert/strict";
import test from "node:test";
import { buildLeftPanelLines } from "../../../src/extensions/md-editor/modal/buildLeftPanelLines.js";
import type { MarkdownFileSnapshot } from "../../../src/extensions/md-editor/file/computeMarkdownFileSnapshot.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Removes ANSI escape sequences from rendered terminal lines.
 */
function stripAnsi(line: string): string {
	return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

/**
 * Creates a markdown snapshot with numbered placeholder lines.
 */
function createSnapshot(lineCount: number): MarkdownFileSnapshot {
	const lines = Array.from({ length: lineCount }, (_, index) => `line ${index + 1}`);
	return { filePath: "demo.md", content: lines.join("\n"), lines, mtimeMs: 1, contentHash: "hash" };
}

test("editor left panel keeps chat markers separated from line numbers", () => {
	const lines = buildLeftPanelLines(createSnapshot(11), 7, new Set([2, 5, 6, 7]), 60, createTestTheme()).map(stripAnsi);

	assert.match(lines[1], /^   2 ● │ line 2/);
	assert.match(lines[6], /^▶  7 ● │ line 7/);
	assert.match(lines[9], /^  10   │ line 10/);
});
