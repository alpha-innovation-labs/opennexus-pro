import assert from "node:assert/strict";
import test from "node:test";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { theme } from "../../../src/pi-internals/theme.js";
import { BorderedAssistantErrorRow } from "../../../src/extensions/tron/thinking/BorderedAssistantErrorRow.js";
import { formatAssistantErrorText } from "../../../src/extensions/tron/thinking/formatAssistantErrorText.js";
import { installAssistantThinkingStyle } from "../../../src/extensions/tron/thinking/installAssistantThinkingStyle.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

/**
 * Removes ANSI escape sequences from rendered text.
 *
 * @param value Rendered text.
 * @returns Plain visible text.
 */
function stripAnsi(value: string): string {
  return value.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

test("tron assistant provider errors keep only the nested json message", () => {
  const errorText = formatAssistantErrorText(
    'Codex error:\n{"type":"error","error":{"type":"server_error","message":"An error occurred while processing your request."}}',
  );

  assert.equal(errorText, "✗ error An error occurred while processing your request.");
});

test("tron assistant provider errors extract the nested message from incomplete json payloads", () => {
  const errorText = formatAssistantErrorText(
    'Codex error:\n{"type":"error","error":{"type":"server_error","message":"An error occurred while processing your request.","param":null,"sequence_number":2}',
  );

  assert.equal(errorText, "✗ error An error occurred while processing your request.");
});

test("tron assistant provider errors render as one red bordered row", async () => {
  await initializePiThemes();

  const lines = new BorderedAssistantErrorRow(theme, formatAssistantErrorText("Provider exploded")).render(40);
  const renderedLine = stripAnsi(lines[0] ?? "");

  assert.equal(renderedLine.startsWith("│✗ error Provider exploded"), true);
  assert.equal(renderedLine.endsWith("│"), true);
  assert.match(lines[0] ?? "", /\x1b\[[0-9;?]*[A-Za-z]/);
});

test("tron assistant abort rows keep the existing plain abort message", async () => {
  await initializePiThemes();
  installAssistantThinkingStyle();

  const component = new AssistantMessageComponent(
    {
      role: "assistant",
      timestamp: 1,
      content: [],
      stopReason: "aborted",
      errorMessage: "Operation aborted",
    } as never,
    true,
  ) as unknown as {
    contentContainer: { children: Array<{ text?: string }> };
  };

  const abortChild = component.contentContainer.children.at(-1)?.text;

  assert.equal(stripAnsi(abortChild ?? "").trim(), "Operation aborted");
});
