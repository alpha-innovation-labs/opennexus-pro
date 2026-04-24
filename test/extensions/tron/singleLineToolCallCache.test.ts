import assert from "node:assert/strict";
import test from "node:test";
import { SingleLineToolCall } from "../../../src/extensions/tron/compact-tool-lines/SingleLineToolCall.js";

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
};

/**
 * Creates a compact tool-call row for render-cache tests.
 *
 * @returns Single-line tool-call component.
 */
function createToolCall(): SingleLineToolCall {
  return new SingleLineToolCall(
    "tool-1",
    "read",
    { main: "src/index.ts", options: "42 lines" },
    theme,
    false,
  );
}

test("single-line tool call reuses cached lines for unchanged width", () => {
  const toolCall = createToolCall();

  const first = toolCall.render(80);
  const second = toolCall.render(80);

  assert.equal(second, first);
});

test("single-line tool call refreshes cached lines when width changes", () => {
  const toolCall = createToolCall();

  const first = toolCall.render(80);
  const second = toolCall.render(40);

  assert.notEqual(second, first);
});
