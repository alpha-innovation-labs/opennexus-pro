import assert from "node:assert/strict";
import test from "node:test";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { installAssistantThinkingStyle } from "../../../src/extensions/tron/thinking/installAssistantThinkingStyle.js";
import { finishAssistantMessageTiming, resetAssistantMessageTimings, startAssistantMessageTiming } from "../../../src/extensions/tron/thinking/assistantMessageTimingState.js";
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

test("tron assistant footer uses the dev agent label override when set", async () => {
  await initializePiThemes();
  resetAssistantMessageTimings();
  process.env.NEXUS_AGENT_LABEL = "Nexus dev";
  installAssistantThinkingStyle();

  startAssistantMessageTiming(0);
  finishAssistantMessageTiming(1, "2s");

  const viewport = await renderComponentInVirtualTerminal(
    () =>
      new AssistantMessageComponent(
        {
          role: "assistant",
          timestamp: 1,
          content: [{ type: "text", text: "Done." }],
        } as never,
        true,
      ),
    80,
    8,
  );

  const plainLines = viewport.map((line) => stripAnsi(line));
  assert.ok(plainLines.some((line) => line.includes("Nexus dev · 2s")));

  delete process.env.NEXUS_AGENT_LABEL;
  resetAssistantMessageTimings();
});
