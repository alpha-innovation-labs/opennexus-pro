import assert from "node:assert/strict";
import test from "node:test";
import { bridgeThinkingToToolCalls } from "../../../packages/extension-core/src/tron/activity/bridgeThinkingToToolCalls.ts";
import { resetAssistantActivityGrouping } from "../../../packages/extension-core/src/tron/activity/resetAssistantActivityGrouping.ts";
import { bridgedToolCallIds } from "../../../packages/extension-core/src/tron/activity/state.ts";
import registerCompactToolLinesExtension from "../../../packages/extension-core/src/tron/compact-tool-lines/registerCompactToolLinesExtension.ts";

type EventHandler = (event: any, ctx?: any) => void;

/**
 * Creates a compact-tool-lines extension harness for lifecycle reset tests.
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

test("tron clears stale thinking bridges on live session start", () => {
	resetAssistantActivityGrouping();
	bridgeThinkingToToolCalls(["read-1"]);

	const handlers = createExtensionHarness();
	handlers.session_start?.({ reason: "resume" }, { sessionManager: { getSessionFile: () => null } });

	assert.equal(bridgedToolCallIds.size, 0);

	resetAssistantActivityGrouping();
});
