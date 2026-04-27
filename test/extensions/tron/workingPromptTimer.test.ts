import assert from "node:assert/strict";
import test from "node:test";
import { createWorkingPromptTimer } from "../../../packages/extensions/src/tron/working-timer/createWorkingPromptTimer.ts";
import { formatWorkingPromptMessage } from "../../../packages/extensions/src/tron/working-timer/formatWorkingPromptMessage.ts";

/**
 * Creates a minimal working-message context for timer tests.
 *
 * @returns Recorded message calls and fake context.
 */
function createFakeWorkingContext(): { messages: Array<string | undefined>; ctx: { hasUI: true; ui: { setWorkingMessage(message?: string): void } } } {
	const messages: Array<string | undefined> = [];
	return {
		messages,
		ctx: {
			hasUI: true,
			ui: {
				setWorkingMessage(message?: string): void {
					messages.push(message);
				},
			},
		},
	};
}

test("formatWorkingPromptMessage renders a spaced prompt duration", () => {
	assert.equal(formatWorkingPromptMessage(1_000, 137_000), "Working... (⏱ 2m 16s)");
});

test("createWorkingPromptTimer sets and clears the working message", () => {
	const { ctx, messages } = createFakeWorkingContext();
	const timer = createWorkingPromptTimer(ctx, 1_000, 60_000, () => 137_000);

	assert.equal(messages[0], "Working... (⏱ 2m 16s)");
	timer.stop();
	assert.equal(messages.at(-1), undefined);
});
