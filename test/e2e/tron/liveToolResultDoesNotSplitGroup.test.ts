import assert from "node:assert/strict";
import test from "node:test";
import registerCompactToolLinesExtension from "../../../src/extensions/tron/compact-tool-lines/registerCompactToolLinesExtension.ts";
import { getActivityNeighbors } from "../../../src/extensions/tron/activity/getActivityNeighbors.ts";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.ts";
import { toolActivityKey } from "../../../src/extensions/tron/activity/toolActivityKey.ts";
import { resetThinkingToolBridge } from "../../../src/extensions/tron/activity/resetThinkingToolBridge.ts";

type EventHandler = (event: any, ctx?: any) => void;

/**
 * Creates a compact-tool-lines extension harness for live grouping tests.
 *
 * @returns Registered handlers.
 */
function createExtensionHarness(): Record<string, EventHandler> {
	const handlers: Record<string, EventHandler> = {};
	registerCompactToolLinesExtension({
		on(eventName: string, handler: EventHandler): void {
			handlers[eventName] = handler;
		},
		registerTool(): void {},
	} as never);
	return handlers;
}

test("tron live toolResult messages do not split one contiguous tool group", () => {
	resetAssistantActivityGrouping();
	resetThinkingToolBridge();

	const handlers = createExtensionHarness();

	handlers.tool_execution_start?.({ toolCallId: "read-1", toolName: "read", args: { path: "a.ts" } });
	handlers.message_end?.({ message: { role: "toolResult", timestamp: 2 } });
	handlers.tool_execution_start?.({ toolCallId: "read-2", toolName: "read", args: { path: "b.ts" } });

	assert.deepEqual(getActivityNeighbors(toolActivityKey("read-1")), { isFirst: true, isLast: false });
	assert.deepEqual(getActivityNeighbors(toolActivityKey("read-2")), { isFirst: false, isLast: true });

	handlers.turn_end?.({ turnIndex: 0 });
	handlers.tool_execution_start?.({ toolCallId: "read-3", toolName: "read", args: { path: "c.ts" } });
	assert.deepEqual(getActivityNeighbors(toolActivityKey("read-3")), { isFirst: true, isLast: true });

	resetAssistantActivityGrouping();
	resetThinkingToolBridge();
});
