import assert from "node:assert/strict";
import test from "node:test";
import registerCompactToolLinesExtension from "../../../src/extensions/tron/compact-tool-lines/registerCompactToolLinesExtension.js";
import { bridgeThinkingToToolCalls } from "../../../src/extensions/tron/activity/bridgeThinkingToToolCalls.js";
import { registerToolActivityGroup } from "../../../src/extensions/tron/activity/registerToolActivityGroup.js";
import { activeToolGroup, bridgedToolCallIds } from "../../../src/extensions/tron/activity/state.js";
import { resetAssistantActivityGrouping } from "../../../src/extensions/tron/activity/resetAssistantActivityGrouping.js";

/**
 * Creates a minimal extension API harness for lifecycle tests.
 *
 * @returns Registered event handlers.
 */
function createHarness(): {
  handlers: Map<string, (event: unknown, ctx: unknown) => void>;
} {
  const handlers = new Map<string, (event: unknown, ctx: unknown) => void>();
  registerCompactToolLinesExtension({
    on(event: string, handler: (payload: unknown, ctx: unknown) => void) {
      handlers.set(event, handler);
    },
    registerTool() {
      return undefined;
    },
    exec() {
      return Promise.resolve({ stdout: "", stderr: "", exitCode: 0 });
    },
  } as never);
  return { handlers };
}

test.afterEach(() => {
  resetAssistantActivityGrouping();
});

test("compact tool-lines clears reconstructed grouping state on session shutdown", () => {
  const { handlers } = createHarness();
  registerToolActivityGroup(["read-1", "grep-1"]);
  bridgeThinkingToToolCalls(["read-1"]);

  handlers.get("session_shutdown")?.({}, {});

  assert.deepEqual(activeToolGroup, []);
  assert.equal(bridgedToolCallIds.size, 0);
});
