import assert from "node:assert/strict";
import test from "node:test";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { installAssistantThinkingStyle } from "../../../src/extensions/tron/thinking/installAssistantThinkingStyle.js";
import { finishAssistantMessageTiming, resetAssistantMessageTimings, startAssistantMessageTiming } from "../../../src/extensions/tron/thinking/assistantMessageTimingState.js";
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

test("tron thinking-only messages do not render empty rows above or below thinking", async () => {
	await initializePiThemes();
	resetAssistantMessageTimings();
	installAssistantThinkingStyle();
	startAssistantMessageTiming(1);
	finishAssistantMessageTiming(1, "2s");

	const viewport = await renderComponentInVirtualTerminal(
		() => new AssistantMessageComponent(
			{
				role: "assistant",
				timestamp: 1,
				content: [{ type: "thinking", thinking: "Done thinking." }],
			} as never,
			true,
		),
		80,
		10,
	);

	const plainLines = viewport.map((line) => stripAnsi(line));
	const topBorderIndex = plainLines.findIndex((line) => line.trimStart().startsWith("┌"));
	const firstBorderIndex = topBorderIndex;
	const bottomBorderIndex = plainLines.findIndex((line) => line.trimStart().startsWith("└"));
	const footerIndex = plainLines.findIndex((line) => line.includes("· 2s"));

	assert.notEqual(firstBorderIndex, -1);
	assert.notEqual(topBorderIndex, -1);
	assert.notEqual(bottomBorderIndex, -1);
	assert.notEqual(footerIndex, -1);
	assert.equal(firstBorderIndex, 0);
	assert.equal(topBorderIndex, firstBorderIndex);
	assert.equal(footerIndex, bottomBorderIndex + 1);
	assert.equal(plainLines.slice(firstBorderIndex, footerIndex).every((line) => line.trim().length > 0), true);
});
