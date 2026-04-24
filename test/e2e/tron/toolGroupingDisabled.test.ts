import assert from "node:assert/strict";
import test from "node:test";
import { bridgeThinkingToToolCalls } from "../../../src/extensions/tron/activity/bridgeThinkingToToolCalls.ts";
import { registerToolActivity } from "../../../src/extensions/tron/activity/registerToolActivity.ts";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.ts";
import { bridgedToolCallIds } from "../../../src/extensions/tron/activity/state.ts";

test("tron experimental grouping disable leaves registerToolActivity as a safe no-op", () => {
	resetAssistantActivityGrouping();
	bridgeThinkingToToolCalls(["tool-1"]);

	registerToolActivity("tool-2");
	registerToolActivity("tool-3");

	assert.deepEqual([...bridgedToolCallIds], ["tool-1"]);

	resetAssistantActivityGrouping();
});
