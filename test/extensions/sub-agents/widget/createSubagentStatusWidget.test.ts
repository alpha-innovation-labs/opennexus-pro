import test from "node:test";
import assert from "node:assert/strict";
import { createSubagentStatusWidget } from "../../../../src/extensions/sub-agent-status-widget/ui/createSubagentStatusWidget.js";
import { sharedSubagentRuntime } from "../../../../src/extensions/sub-agents/runtime/sharedSubagentRuntime.js";
import { createSubagentRun } from "../../../../src/extensions/sub-agents/runtime/createSubagentRun.js";

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
 * Verifies the status widget renders Tintin-style heading and running rows.
 */
test("createSubagentStatusWidget renders Tintin-style running subagents", () => {
  const run = createSubagentRun("scan", { description: "Explore repo", subagentType: "Explore" });
  run.status = "running";
  run.startedAt = Date.now();
  run.activeTool = { toolName: "read", outputText: "src/index.ts", startedAt: Date.now() };
  sharedSubagentRuntime.setRun(run);

  const widget = createSubagentStatusWidget(createWidgetContext(false));
  const lines = widget.render(120);

  assert.equal(lines.length > 1, true);
  assert.match(lines[0], /Agents \(async\)/);
  assert.match(lines[1], /Explore/);
  assert.match(lines[1], /read/);
  assert.match(lines[lines.length - 1], /Working\.\.\./);
});

/**
 * Verifies multiline and control-character output is flattened for the widget row.
 */
test("createSubagentStatusWidget sanitizes multiline tool output", () => {
  const run = createSubagentRun("scan", { description: "Inspect output", subagentType: "Explore" });
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
 * Verifies the foreground Working row shows even without async agents.
 */
test("createSubagentStatusWidget shows a standalone Working row while the parent prompt streams", () => {
  const widget = createSubagentStatusWidget(createWidgetContext(false));
  const lines = widget.render(120);

  assert.equal(lines.some((line) => /Working\.\.\./.test(line)), true);
});
