import assert from "node:assert/strict";
import test from "node:test";
import { renderSummary } from "../../../packages/extension-core/src/tron/compact-tool-lines/renderSummary.ts";
import { summarizeArgs } from "../../../packages/extension-core/src/tron/compact-tool-lines/summarizeArgs.ts";
import { theme } from "../../../packages/pi-platform/src/theme.js";
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

test("tron tool call summary renders standalone calls with explicit frame chrome", async () => {
	await initializePiThemes();

	const lines = renderSummary("read-1", "read", summarizeArgs("read", { path: "README.md" }), theme, false)
		.render(100)
		.map((line) => stripAnsi(line));

	assert.equal(lines.length, 3);
	assert.equal(lines[0]?.trimStart().startsWith("┌"), true);
	assert.equal(lines[1]?.includes("read"), true);
	assert.equal(lines[2]?.trimStart().startsWith("└"), true);
});
