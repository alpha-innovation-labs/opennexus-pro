import test from "node:test";
import assert from "node:assert/strict";
import { createSubagentStatusWidget } from "../../../../packages/extension-core/src/sub-agent-status-widget/ui/createSubagentStatusWidget.js";
import { sharedSubagentRuntime } from "../../../../packages/extension-core/src/sub-agents/runtime/sharedSubagentRuntime.js";
import { createSubagentRun } from "../../../../packages/extension-core/src/sub-agents/runtime/createSubagentRun.js";

/**
 * Creates one minimal theme stub for widget tests.
 *
 * @returns Theme-wrapped widget context.
 */
function createWidgetContext(isIdle = false) {
  return {
    isIdle() {
      return isIdle;
    },
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
 * Verifies the status widget renders async subagents without a foreground Working row.
 */
test("createSubagentStatusWidget renders Tintin-style running subagents", () => {
  const run = createSubagentRun("scan", { description: "Explore repo", subagentType: "Explore" }, "/tmp/project");
  run.status = "running";
  run.startedAt = Date.now();
  run.activeTool = { toolName: "read", outputText: "src/index.ts", startedAt: Date.now() };
  sharedSubagentRuntime.setRun(run);

  const widget = createSubagentStatusWidget(createWidgetContext(false));
  const lines = widget.render(120);

  assert.equal(lines.length, 2);
  assert.match(lines[0], /Agents \(async\)/);
  assert.match(lines[1], /Explore/);
  assert.match(lines[1], /read/);
  assert.doesNotMatch(lines[1], /Working\.\.\./);
});

/**
 * Verifies multiline and control-character output is flattened for the widget row.
 */
test("createSubagentStatusWidget sanitizes multiline tool output", () => {
  const run = createSubagentRun("scan", { description: "Inspect output", subagentType: "Explore" }, "/tmp/project");
  run.status = "running";
  run.startedAt = Date.now();
  run.activeTool = {
    toolName: "bash",
    outputText: "\u001b[31mfirst line\u001b[0m\nsecond line",
    startedAt: Date.now(),
    args: { command: "printf test" },
  };
  sharedSubagentRuntime.setRun(run);

  const widget = createSubagentStatusWidget(createWidgetContext(false));
  const lines = widget.render(120);

  assert.match(lines[1], /first line/);
  assert.doesNotMatch(lines[1], /second line/);
});

/**
 * Verifies the widget stays empty when only the parent prompt is streaming.
 */
test("createSubagentStatusWidget omits the foreground Working row", () => {
  const widget = createSubagentStatusWidget(createWidgetContext(false));
  const lines = widget.render(120);

  assert.deepEqual(lines, []);
});
