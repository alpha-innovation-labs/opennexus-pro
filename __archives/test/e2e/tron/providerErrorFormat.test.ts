import assert from "node:assert/strict";
import test from "node:test";
import { AssistantMessageComponent } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { installAssistantThinkingStyle } from "../../../packages/extension-core/src/tron/thinking/installAssistantThinkingStyle.js";
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

test("tron assistant provider errors extract the nested message and render without a top spacer", async () => {
  await initializePiThemes();
  installAssistantThinkingStyle();

  const viewport = await renderComponentInVirtualTerminal(
    () =>
      new AssistantMessageComponent(
        {
          role: "assistant",
          timestamp: 1,
          content: [],
          stopReason: "error",
          errorMessage: 'Codex error:\n{"type":"error","error":{"type":"server_error","message":"An error occurred while processing your request."}}',
        } as never,
        true,
      ),
    80,
    8,
  );

  const plainLines = viewport.map((line) => stripAnsi(line));
  const errorLineIndex = plainLines.findIndex((line) => line.includes("✗ error An error occurred while processing your request."));

  assert.equal(errorLineIndex, 0);
  assert.equal(plainLines.some((line) => line.includes("Codex error:")), false);
  assert.equal(plainLines.some((line) => line.includes('{"type":"error"')), false);
  assert.equal(plainLines[errorLineIndex]?.startsWith("│"), true);
  assert.equal(plainLines[errorLineIndex]?.endsWith("│"), true);
});
