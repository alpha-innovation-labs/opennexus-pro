import assert from "node:assert/strict";
import test from "node:test";
import { createSubagentStatusWidget } from "../../../src/extensions/sub-agent-status-widget/ui/createSubagentStatusWidget.js";
import { sharedSubagentRuntime } from "../../../src/extensions/sub-agents/runtime/sharedSubagentRuntime.js";
import { createSubagentRun } from "../../../src/extensions/sub-agents/runtime/createSubagentRun.js";

/**
 * Creates one minimal theme stub for widget tests.
 *
 * @returns Theme-wrapped widget context.
 */
function createWidgetContext() {
  return {
    ui: {
      theme: {
        fg: (_color: string, text: string) => text,
        bold: (text: string) => text,
      },
    },
  } as any;
}

/**
 * Resets the shared runtime between widget assertions.
 */
function resetRuntime(): void {
  sharedSubagentRuntime.clear();
}

test.beforeEach(() => {
  resetRuntime();
});

test.after(() => {
  resetRuntime();
});

/**
 * Verifies the widget stays visible when a chat has any subagent history.
 */
test("createSubagentStatusWidget stays visible for completed subagent history", () => {
  const run = createSubagentRun(
    "Tell me a joke",
    { description: "Librarian joke", subagentType: "Librarian" },
    "/workspace/project",
  );
  run.status = "completed";
  run.completedAt = Date.now();
  run.resultText = "Why did the coder smile? Because the bug was caught.";
  sharedSubagentRuntime.setRun(run);

  const widget = createSubagentStatusWidget(createWidgetContext());
  const lines = widget.render(120);

  assert.equal(lines.length >= 2, true);
  assert.match(lines[0], /Agents \(async\)/);
  assert.match(lines[1], /completed/);
  assert.match(lines[1], /bug was caught/);
});
