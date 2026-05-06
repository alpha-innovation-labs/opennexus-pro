import assert from "node:assert/strict";
import test from "node:test";
import { getPromptlineFrameLeftPadding } from "../../../packages/extensions/src/neo-editor/features/promptline/layout/getPromptlineFrameLeftPadding.js";
import { getPromptlineFrameWidth } from "../../../packages/extensions/src/neo-editor/features/promptline/layout/getPromptlineFrameWidth.js";
import { hasConversationMessages } from "../../../packages/extensions/src/neo-editor/features/promptline/layout/hasConversationMessages.js";
import { padPromptlineFrameToWidth } from "../../../packages/extensions/src/neo-editor/features/promptline/layout/padPromptlineFrameToWidth.js";

test("promptline uses half width for wide empty conversations and full width after messages", () => {
	assert.equal(getPromptlineFrameWidth(120, false), 60);
	assert.equal(getPromptlineFrameWidth(120, true), 120);
});

test("promptline uses full width when half-width would be too narrow", () => {
	assert.equal(getPromptlineFrameWidth(79, false), 79);
	assert.equal(getPromptlineFrameWidth(80, false), 40);
});

test("promptline compact frame is centered inside the terminal", () => {
	assert.equal(getPromptlineFrameLeftPadding(120, 60), 30);
	assert.deepEqual(padPromptlineFrameToWidth(["╭──╮", "╰──╯"], 10, 4), ["   ╭──╮", "   ╰──╯"]);
});

test("promptline detects conversation messages from the active branch", () => {
	assert.equal(hasConversationMessages({ sessionManager: { getBranch: () => [] } } as never), false);
	assert.equal(
		hasConversationMessages({ sessionManager: { getBranch: () => [{ type: "model_change" }, { type: "message" }] } } as never),
		true,
	);
});
