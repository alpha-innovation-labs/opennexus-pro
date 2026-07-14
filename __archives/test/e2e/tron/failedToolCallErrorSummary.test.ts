import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@earendil-works/pi-tui";
import { ToolExecutionComponent } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { registerCompactBuiltInTool } from "../../../packages/extension-core/src/tron/compact-tool-lines/registerCompactBuiltInTool.js";
import { applyToolExecutionSpacingPatch } from "../../../packages/pi-platform/src/applyToolExecutionSpacingPatch.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

/**
 * Removes ANSI escape sequences from rendered terminal lines.
 *
 * @param line Rendered terminal line.
 * @returns Plain visible text.
 */
function stripAnsi(line: string): string {
  return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

/**
 * Captures one compact built-in tool definition from the extension registration API.
 *
 * @param toolName Built-in tool name.
 * @returns Registered tool definition.
 */
function captureCompactBuiltInTool(toolName: "read"): unknown {
  let registeredTool: unknown;
  registerCompactBuiltInTool({
    registerTool(tool: unknown) {
      registeredTool = tool;
    },
  } as never, toolName);
  assert.ok(registeredTool, "expected compact tool registration");
  return registeredTool;
}

test("tron failed tool calls render as one red inline error summary", async () => {
  await initializePiThemes();
  applyToolExecutionSpacingPatch();
  const readTool = captureCompactBuiltInTool("read");
  const viewport = await renderComponentInVirtualTerminal(() => {
    const root = new Container();
    const toolExecution = new ToolExecutionComponent(
      "read",
      "read-error-1",
      { path: "README.md" },
      {},
      readTool as never,
      { requestRender() {} } as never,
      process.cwd(),
    );
    toolExecution.updateResult({
      content: [{ type: "text", text: "Permission denied while reading file" }],
      details: {},
      isError: true,
    } as never, false);
    root.addChild(toolExecution);
    return root;
  }, 100, 8);

  const plainLines = viewport.map((line) => stripAnsi(line));
  const errorLine = plainLines.find((line) => line.includes("read") && line.includes("Permission denied"));
  assert.ok(errorLine, "expected failed read summary to include the error text");
  assert.match(errorLine, /read .*Permission denied while reading file/);
  assert.doesNotMatch(errorLine, /README\.md/);
});
