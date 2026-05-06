import assert from "node:assert/strict";
import test from "node:test";
import { Text } from "@mariozechner/pi-tui";
import { ToolExecutionComponent } from "../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { applyToolExecutionSpacingPatch } from "../../packages/pi-platform/src/applyToolExecutionSpacingPatch.js";

/**
 * Creates a minimal UI stub for tool execution tests.
 *
 * @returns UI stub.
 */
function createUiStub() {
  return {
    requestRender() {},
  };
}

test("tool execution spacing patch removes the leading spacer for every tool", () => {
  applyToolExecutionSpacingPatch();

  const component = new ToolExecutionComponent(
    "custom-tool",
    "call-1",
    {},
    {},
    {
      renderShell: "self",
      renderCall() {
        return new Text("tool body", 0, 0);
      },
    } as never,
    createUiStub() as never,
    process.cwd(),
  );

  const lines = component.render(40);

  assert.equal(lines[0]?.trimEnd(), "tool body");
});
