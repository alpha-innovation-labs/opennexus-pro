import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@mariozechner/pi-tui";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { installAssistantThinkingStyle } from "../../../src/extensions/tron/thinking/installAssistantThinkingStyle.js";
import { renderSummary } from "../../../src/extensions/tron/compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../../../src/extensions/tron/compact-tool-lines/summarizeArgs.js";
import { applyToolExecutionSpacingPatch } from "../../../src/pi-internals/applyToolExecutionSpacingPatch.js";
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

test("tron renders the first tool immediately after thinking with no spacer or tool border row", async () => {
  await initializePiThemes();
  applyToolExecutionSpacingPatch();
  installAssistantThinkingStyle();
  const viewport = await renderComponentInVirtualTerminal(() => {
    const root = new Container();
    const assistantMessage = new AssistantMessageComponent(
      {
        role: "assistant",
        content: [
          { type: "thinking", thinking: "I should inspect the repository before I answer." },
          { type: "toolCall", id: "call-1", name: "read", arguments: { path: "README.md" } },
        ],
      } as never,
      true,
    );
    const toolExecution = new ToolExecutionComponent(
      "read",
      "call-1",
      { path: "README.md" },
      {},
      {
        skipLeadingSpacer: true,
        renderShell: "self",
        renderCall(args: { path: string }, theme: unknown) {
          return renderSummary("call-1", "read", summarizeArgs("read", args), theme, false);
        },
      } as never,
      { requestRender() {} } as never,
    );

    root.addChild(assistantMessage);
    root.addChild(toolExecution);
    return root;
  }, 100, 12);

  const plainLines = viewport.map((line) => stripAnsi(line));
  const thinkingIndex = plainLines.findIndex((line) => line.includes("I should inspect the repository"));
  const dividerIndex = plainLines.findIndex((line) => line.trimStart().startsWith("├"));
  const firstToolIndex = plainLines.findIndex((line) => line.includes("read") && line.includes("README.md"));

  assert.notEqual(thinkingIndex, -1);
  assert.notEqual(dividerIndex, -1);
  assert.notEqual(firstToolIndex, -1);
  assert.equal(dividerIndex, thinkingIndex + 1);
  assert.equal(firstToolIndex, dividerIndex + 1);
  assert.equal(plainLines[firstToolIndex - 1]?.trimStart().startsWith("├"), true);
  assert.notEqual(plainLines[firstToolIndex - 1]?.trim(), "");
  assert.notEqual(plainLines[firstToolIndex]?.trim(), "");
  assert.equal(plainLines[firstToolIndex]?.trimStart().startsWith("┌"), false);
  assert.equal(plainLines[firstToolIndex]?.trimStart().startsWith("└"), false);
});
