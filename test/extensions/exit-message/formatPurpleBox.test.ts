import assert from "node:assert/strict";
import test from "node:test";
import { formatPurpleBox } from "../../../src/extensions/exit-message/formatPurpleBox.js";

test("formatPurpleBox keeps every visible line within the requested width", () => {
	const box = formatPurpleBox([
		{ text: "To resume this session, run:" },
		{ text: "nexus --resume 019dbf9b-dc9e-7738-b555-d1f8ed1c24f2", style: (text) => `\u001b[1;35m${text}\u001b[0m` },
		{ text: "This session's title is:" },
		{ text: "[sub] # Workflow Librarian You are the context and planning agent for a Nexus workflow", style: (text) => `\u001b[1m${text}\u001b[0m` },
	], 60);

	for (const line of box.split("\n")) {
		assert.ok(stripAnsi(line).length <= 60, line);
	}
});

/**
 * Removes ANSI escape sequences.
 *
 * @param value Styled string.
 * @returns Plain string.
 */
function stripAnsi(value: string): string {
	return value.replace(/\u001b\[[0-9;]*m/g, "");
}
