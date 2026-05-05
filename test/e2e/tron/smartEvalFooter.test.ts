import assert from "node:assert/strict";
import test from "node:test";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { clearSmartEvalState, setSmartEvalExpanded, setSmartEvalResult } from "../../../packages/extensions/src/smart-eval/state/smartEvalState.js";
import { finishAssistantMessageTiming, resetAssistantMessageTimings, startAssistantMessageTiming } from "../../../packages/extensions/src/tron/thinking/assistantMessageTimingState.js";
import { installAssistantThinkingStyle } from "../../../packages/extensions/src/tron/thinking/installAssistantThinkingStyle.js";
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
 * Renders one assistant message in the virtual terminal.
 *
 * @returns Plain terminal lines.
 */
async function renderAssistantLines(): Promise<string[]> {
	const viewport = await renderComponentInVirtualTerminal(
		() =>
			new AssistantMessageComponent(
				{
					role: "assistant",
					timestamp: 11,
					content: [{ type: "text", text: "Done." }],
				} as never,
				true,
			),
		100,
		10,
	);
	return viewport.map((line) => stripAnsi(line));
}

test("smart-eval appends compact and expanded score details to the assistant footer", async () => {
	await initializePiThemes();
	resetAssistantMessageTimings();
	clearSmartEvalState();
	installAssistantThinkingStyle();
	startAssistantMessageTiming(0);
	finishAssistantMessageTiming(11, "3s");
	setSmartEvalResult({
		assistantTimestamp: 11,
		questions: [
			{ question: "Did the assistant truthfully answer the user's question?", passed: true },
			{ question: "Did the assistant understand the user's question?", passed: true },
			{ question: "Did the tool work and the thinking solve the problem without hacks?", passed: false },
		],
	});

	assert.ok((await renderAssistantLines()).some((line) => line.includes("· 3s · 2/3 ✕")));
	setSmartEvalExpanded(true);
	const expandedLines = await renderAssistantLines();
	assert.ok(expandedLines.some((line) => line.includes("Did the assistant truthfully answer the user's question?: yes")));
	assert.ok(expandedLines.some((line) => line.includes("Did the tool work and the thinking solve the problem without hacks?: no")));

	clearSmartEvalState();
	resetAssistantMessageTimings();
});
