import test from "node:test";
import assert from "node:assert/strict";
import { renderSubagentTranscriptLines } from "../../../../src/extensions/sub-agents/ui/renderSubagentTranscriptLines.js";

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
  italic: (text: string) => text,
};

/**
 * Verifies the transcript renderer reuses Tron tool detail renderers.
 */
test("renderSubagentTranscriptLines reuses Tron tool detail renderers", () => {
  const lines = renderSubagentTranscriptLines(theme as any, 80, {
    transcript: [
      {
        role: "tool",
        text: "read src/index.ts",
        createdAt: Date.now(),
        toolCallId: "tool-1",
        toolName: "read",
        args: { path: "src/index.ts" },
        result: { isError: false, content: [{ type: "text", text: "file text" }] },
      },
    ],
  } as any);

  assert.equal(lines.some((line) => line.includes("Call")), true);
  assert.equal(lines.some((line) => line.includes("Result")), true);
  assert.equal(lines.some((line) => line.includes("src/index.ts")), true);
});
