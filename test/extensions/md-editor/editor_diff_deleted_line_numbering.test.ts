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
 * Builds a snapshot from current markdown content.
 */
function createSnapshot(content: string): MarkdownFileSnapshot {
	return { filePath: "demo.md", content, lines: content.split(/\r?\n/), mtimeMs: 1, contentHash: "hash" };
}

test("editor diff numbering stays tied to current file lines after deleting heading", () => {
	const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
	const previous = ["# Introduction", "", lorem, "", "", lorem, "", "Sous la lune"].join("\n");
	const current = [lorem, "", "", lorem, "", "Sous la lune"].join("\n");
	const lines = buildLeftPanelLines(createSnapshot(current), 1, new Set([1, 2, 6]), 100, createTestTheme(), previous).map(stripAnsi);
	const numberedLines = lines.filter((line) => /^│?[▶ ]\s*\d+/.test(line.trimStart()) || /^[▶ ]\s*\d+/.test(line));
	const displayedNumbers = numberedLines.map((line) => Number(line.match(/[▶ ]\s*(\d+)/)?.[1])).filter(Number.isFinite);

	assert.deepEqual([...new Set(displayedNumbers)], [1, 2, 3, 4, 5, 6]);
	assert.equal(displayedNumbers.some((lineNumber) => lineNumber > 6), false);
	assert.equal(lines.some((line) => line.includes("Lorem#") || line.includes("# ipsum")), false);
});
