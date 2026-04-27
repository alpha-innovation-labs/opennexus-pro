import assert from "node:assert/strict";
import test from "node:test";
import { showSubagentHistoryModal } from "../../../../packages/extensions/src/sub-agents/ui/showSubagentHistoryModal.js";

/**
 * Verifies /agents loads only the current parent cwd/session scope.
 */
test("showSubagentHistoryModal loads runs from the current parent scope", async () => {
  let receivedFilter: { cwd?: string; parentSessionFile?: string } | undefined;

  const ctx = {
    hasUI: true,
    cwd: "/workspace/project",
    sessionManager: {
      getSessionFile() {
        return "/sessions/parent.jsonl";
      },
    },
    ui: {
      async custom(factory: unknown, options: unknown) {
        assert.equal(typeof factory, "function");
        assert.equal((options as { overlay?: boolean }).overlay, true);
      },
    },
  } as any;

  await showSubagentHistoryModal(ctx, async (filter) => {
    receivedFilter = filter;
    return [];
  });

  assert.deepEqual(receivedFilter, {
    cwd: "/workspace/project",
    parentSessionFile: "/sessions/parent.jsonl",
  });
});
