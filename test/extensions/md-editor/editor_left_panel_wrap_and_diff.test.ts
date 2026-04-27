import assert from "node:assert/strict";
import test from "node:test";
import { buildLeftPanelLines } from "../../../src/extensions/md-editor/modal/buildLeftPanelLines.js";
import { renderMarkdownDiffRows } from "../../../src/extensions/md-editor/diff/renderMarkdownDiffRows.js";
import type { MarkdownFileSnapshot } from "../../../src/extensions/md-editor/file/computeMarkdownFileSnapshot.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Removes ANSI escape sequences from rendered terminal lines.
 */
function stripAnsi(line: string): string {
	return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

/**
 * Creates a markdown snapshot from content.
 */
function createSnapshot(content: string): MarkdownFileSnapshot {
	return { filePath: "demo.md", content, lines: content.split(/\r?\n/), mtimeMs: 1, contentHash: "hash" };
}

test("editor left panel wraps long lines with continuation gutters", () => {
	const snapshot = createSnapshot("alpha beta gamma delta epsilon zeta eta theta");
	const lines = buildLeftPanelLines(snapshot, 1, new Set([1]), 24, createTestTheme()).map(stripAnsi);

	assert.ok(lines.length > 1);
	assert.match(lines[0], /^▶ 1 ● │ alpha beta/);
	assert.match(lines[1], /^      │ /);
	assert.equal(lines.some((line) => line.includes("…")), false);
});

test("editor diff keeps inserted heading on its own current line", () => {
	const previous = "Lorem ipsum dolor\n\nSous la lune";
	const next = "# Introduction\n\nLorem ipsum dolor\n\nSous la lune";
	const rows = renderMarkdownDiffRows(previous, next, createTestTheme()).map((row) => ({ ...row, text: stripAnsi(row.text) }));

	assert.equal(rows[0].currentLineNumber, 1);
	assert.equal(rows[0].text, "# Introduction");
	assert.equal(rows[2].currentLineNumber, 3);
	assert.equal(rows[2].text, "Lorem ipsum dolor");
	assert.equal(rows[0].text.includes("Lorem"), false);
});
