import assert from "node:assert/strict";
import test from "node:test";
import { bootstrapAssistantActivityGrouping } from "../../../src/extensions/tron/activity/bootstrapAssistantActivityGrouping.ts";
import { getActivityNeighbors } from "../../../src/extensions/tron/activity/getActivityNeighbors.ts";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.ts";
import { toolActivityKey } from "../../../src/extensions/tron/activity/toolActivityKey.ts";

test("tron experimental grouping disable leaves resumed tool rows standalone", () => {
	resetAssistantActivityGrouping();

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

	assert.deepEqual(getActivityNeighbors(toolActivityKey("read-1")), { isFirst: true, isLast: true });
	assert.deepEqual(getActivityNeighbors(toolActivityKey("read-2")), { isFirst: true, isLast: true });

	resetAssistantActivityGrouping();
});
