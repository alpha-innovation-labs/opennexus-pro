import assert from "node:assert/strict";
import test from "node:test";
import { getPromptlineFrameLeftPadding } from "../../../src/extensions/neo-editor/features/promptline/layout/getPromptlineFrameLeftPadding.js";
import { getPromptlineFrameWidth } from "../../../src/extensions/neo-editor/features/promptline/layout/getPromptlineFrameWidth.js";
import { hasConversationMessages } from "../../../src/extensions/neo-editor/features/promptline/layout/hasConversationMessages.js";
import { padPromptlineFrameToWidth } from "../../../src/extensions/neo-editor/features/promptline/layout/padPromptlineFrameToWidth.js";

test("promptline uses half width for empty conversations and full width after messages", () => {
	assert.equal(getPromptlineFrameWidth(120, false), 60);
	assert.equal(getPromptlineFrameWidth(120, true), 120);
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
