import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { installAssistantThinkingStyle } from "../../../src/extensions/tron/thinking/installAssistantThinkingStyle.js";
import { finishAssistantMessageTiming, resetAssistantMessageTimings, startAssistantMessageTiming } from "../../../src/extensions/tron/thinking/assistantMessageTimingState.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

const VIEWPORT_WIDTH = 80;
const EXPECTED_THINKING_WIDTH = VIEWPORT_WIDTH;
const THINKING_TEXT = [
  "Tron should keep this visible thinking block at the full transcript width even when the content is long enough to wrap across multiple rendered lines.",
  "That preserves the original transcript layout for both expanded and collapsed thinking presentations.",
].join(" ");

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
 * Renders one Tron thinking-only message.
 *
 * @param hideThinkingBlock Whether the message should use the collapsed preview style.
 * @returns Plain rendered viewport lines.
 */
async function renderThinkingViewport(hideThinkingBlock: boolean): Promise<string[]> {
  await initializePiThemes();
  resetAssistantMessageTimings();
  installAssistantThinkingStyle();
  startAssistantMessageTiming(1);
  finishAssistantMessageTiming(1, "2s");

  const viewport = await renderComponentInVirtualTerminal(
    () =>
      new AssistantMessageComponent(
        {
          role: "assistant",
          timestamp: 1,
          content: [{ type: "thinking", thinking: THINKING_TEXT }],
        } as never,
        hideThinkingBlock,
      ),
    VIEWPORT_WIDTH,
    20,
  );

  return viewport.map((line) => stripAnsi(line));
}

/**
 * Returns the rendered thinking block lines before the footer.
 *
 * @param lines Plain rendered viewport lines.
 * @returns Non-empty thinking block lines.
 */
function getThinkingBlockLines(lines: string[]): string[] {
  const footerIndex = lines.findIndex((line) => line.includes("· 2s"));
  const thinkingLines = (footerIndex === -1 ? lines : lines.slice(0, footerIndex)).filter((line) => line.trim().length > 0);
  assert.ok(thinkingLines.length > 0, "expected rendered thinking lines before the footer");
  return thinkingLines;
}

test("tron visible thinking markdown uses full width", async () => {
  const thinkingLines = getThinkingBlockLines(await renderThinkingViewport(false));
  const widestLine = Math.max(...thinkingLines.map((line) => visibleWidth(line)));

  assert.equal(widestLine, EXPECTED_THINKING_WIDTH);
});

test("tron collapsed thinking preview uses full width", async () => {
  const thinkingLines = getThinkingBlockLines(await renderThinkingViewport(true));
  const widestLine = Math.max(...thinkingLines.map((line) => visibleWidth(line)));

  assert.equal(widestLine, EXPECTED_THINKING_WIDTH);
});
