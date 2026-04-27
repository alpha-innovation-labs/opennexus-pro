import assert from "node:assert/strict";
import test from "node:test";
import { bridgeThinkingToToolCalls } from "../../../packages/extensions/src/tron/activity/bridgeThinkingToToolCalls.ts";
import { registerToolActivity } from "../../../packages/extensions/src/tron/activity/registerToolActivity.ts";
import { resetAssistantActivityGrouping } from "../../../packages/extensions/src/tron/activity/resetAssistantActivityGrouping.ts";
import { bridgedToolCallIds } from "../../../packages/extensions/src/tron/activity/state.ts";

test("tron experimental grouping disable leaves registerToolActivity as a safe no-op", () => {
	resetAssistantActivityGrouping();
	bridgeThinkingToToolCalls(["tool-1"]);

	registerToolActivity("tool-2");
	registerToolActivity("tool-3");

	assert.deepEqual([...bridgedToolCallIds], ["tool-1"]);

	resetAssistantActivityGrouping();
});
