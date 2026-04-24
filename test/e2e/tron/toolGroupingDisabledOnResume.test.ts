import assert from "node:assert/strict";
import test from "node:test";
import { bootstrapAssistantActivityGrouping } from "../../../src/extensions/tron/activity/bootstrapAssistantActivityGrouping.ts";
import { bridgeThinkingToToolCalls } from "../../../src/extensions/tron/activity/bridgeThinkingToToolCalls.ts";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.ts";
import { bridgedToolCallIds } from "../../../src/extensions/tron/activity/state.ts";

test("tron experimental grouping disable clears stale thinking bridges on resume bootstrap", () => {
	resetAssistantActivityGrouping();
	bridgeThinkingToToolCalls(["read-1"]);

	bootstrapAssistantActivityGrouping([
		{ type: "message", message: { role: "user", timestamp: 1, content: [{ type: "text", text: "go" }] } } as never,
		{
			type: "message",
			message: {
				role: "assistant",
				timestamp: 2,
				content: [
					{ type: "thinking", thinking: "Need to inspect." },
					{ type: "toolCall", id: "read-1", name: "read", arguments: { path: "a.ts" } },
					{ type: "toolCall", id: "read-2", name: "read", arguments: { path: "b.ts" } },
				],
			},
		} as never,
	]);

	assert.equal(bridgedToolCallIds.size, 0);

	resetAssistantActivityGrouping();
});
