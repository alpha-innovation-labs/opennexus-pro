import assert from "node:assert/strict";
import test from "node:test";
import { renderSummary } from "../../../src/extensions/tron/compact-tool-lines/renderSummary.ts";
import { summarizeArgs } from "../../../src/extensions/tron/compact-tool-lines/summarizeArgs.ts";
import { theme } from "../../../src/pi-internals/theme.js";
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

test("tron tool call summary renders without top or bottom borders", async () => {
	await initializePiThemes();

	const lines = renderSummary("read-1", "read", summarizeArgs("read", { path: "README.md" }), theme, false)
		.render(100)
		.map((line) => stripAnsi(line));

	assert.equal(lines.length, 1);
	assert.equal(lines[0]?.trimStart().startsWith("┌"), false);
	assert.equal(lines[0]?.trimStart().startsWith("└"), false);
	assert.equal(lines[0]?.includes("read"), true);
});
