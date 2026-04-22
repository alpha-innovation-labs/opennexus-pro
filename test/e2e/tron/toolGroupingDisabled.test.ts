import assert from "node:assert/strict";
import test from "node:test";
import { getActivityNeighbors } from "../../../src/extensions/tron/activity/getActivityNeighbors.ts";
import { registerToolActivity } from "../../../src/extensions/tron/activity/registerToolActivity.ts";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.ts";
import { toolActivityKey } from "../../../src/extensions/tron/activity/toolActivityKey.ts";

test("tron experimental grouping disable keeps each live tool row standalone", () => {
	resetAssistantActivityGrouping();

	registerToolActivity("tool-1");
	registerToolActivity("tool-2");

	assert.deepEqual(getActivityNeighbors(toolActivityKey("tool-1")), { isFirst: true, isLast: true });
	assert.deepEqual(getActivityNeighbors(toolActivityKey("tool-2")), { isFirst: true, isLast: true });

	resetAssistantActivityGrouping();
});
