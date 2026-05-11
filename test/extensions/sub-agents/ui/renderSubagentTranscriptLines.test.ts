import test from "node:test";
import assert from "node:assert/strict";
import { renderSubagentTranscriptLines } from "../../../../packages/extension-core/src/sub-agents/ui/renderSubagentTranscriptLines.js";
import { initializePiThemes } from "../../../support/theme/initializePiThemes.js";

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
  italic: (text: string) => text,
};

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
 * Verifies the transcript renderer reuses Tron compact tool renderers.
 */
test("renderSubagentTranscriptLines reuses Tron compact tool renderers", () => {
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

  assert.equal(lines.some((line) => line.includes("read")), true);
  assert.equal(lines.some((line) => line.includes("src/index.ts")), true);
});

test("renderSubagentTranscriptLines lets thinking absorb adjacent transcript spacing", async () => {
  process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@earendil-works/pi-coding-agent`;
  await initializePiThemes();
  const lines = renderSubagentTranscriptLines(theme as any, 80, {
    transcript: [
      { role: "user", text: "please fix it", createdAt: 1 },
      { role: "thinking", text: "I should inspect the renderer.", createdAt: 2 },
      { role: "tool", text: "", createdAt: 3, toolCallId: "call-1", toolName: "read", args: { path: "src/file.ts" } },
    ],
  } as any).map((line) => stripAnsi(line));

  const thinkingIndex = lines.findIndex((line) => line.includes("I should inspect the renderer."));
  const toolIndex = lines.findIndex((line) => line.includes("read") && line.includes("src/file.ts"));

  assert.equal(lines.includes(""), false);
  assert.notEqual(thinkingIndex, -1);
  assert.notEqual(toolIndex, -1);
  assert.equal(lines[thinkingIndex - 1]?.trimStart().startsWith("┌"), true);
  assert.equal(lines[thinkingIndex + 1]?.trimStart().startsWith("├"), true);
  assert.equal(toolIndex, thinkingIndex + 2);
});

test("renderSubagentTranscriptLines lets thinking connect back to a previous tool row", async () => {
  process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@earendil-works/pi-coding-agent`;
  await initializePiThemes();
  const lines = renderSubagentTranscriptLines(theme as any, 80, {
    transcript: [
      { role: "tool", text: "", createdAt: 1, toolCallId: "call-1", toolName: "edit", args: { path: "src/file.ts", edits: [] } },
      { role: "thinking", text: "I should inspect the renderer.", createdAt: 2 },
      { role: "tool", text: "", createdAt: 3, toolCallId: "call-2", toolName: "read", args: { path: "src/file.ts" } },
    ],
  } as any).map((line) => stripAnsi(line));

  const editIndex = lines.findIndex((line) => line.includes("edit") && line.includes("src/file.ts"));
  const thinkingIndex = lines.findIndex((line) => line.includes("I should inspect the renderer."));
  const readIndex = lines.findIndex((line) => line.includes("read") && line.includes("src/file.ts"));

  assert.equal(lines.includes(""), false);
  assert.notEqual(editIndex, -1);
  assert.notEqual(thinkingIndex, -1);
  assert.notEqual(readIndex, -1);
  assert.equal(lines[thinkingIndex - 2]?.trimStart().startsWith("└"), true);
  assert.equal(lines[thinkingIndex - 1]?.trimStart().startsWith("┌"), true);
  assert.equal(lines[thinkingIndex + 1]?.trimStart().startsWith("├"), true);
  assert.equal(readIndex, thinkingIndex + 2);
});

test("renderSubagentTranscriptLines does not insert blank rows between adjacent tool calls", async () => {
  process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@earendil-works/pi-coding-agent`;
  await initializePiThemes();
  const lines = renderSubagentTranscriptLines(theme as any, 80, {
    transcript: [
      { role: "thinking", text: "Run both commands.", createdAt: 1 },
      { role: "tool", text: "", createdAt: 2, toolCallId: "call-1", toolName: "bash", args: { command: "echo A" } },
      { role: "tool", text: "", createdAt: 3, toolCallId: "call-2", toolName: "bash", args: { command: "echo B" } },
    ],
  } as any).map((line) => stripAnsi(line));

  const firstToolIndex = lines.findIndex((line) => line.includes("bash") && line.includes("echo A"));
  const secondToolIndex = lines.findIndex((line) => line.includes("bash") && line.includes("echo B"));

  assert.notEqual(firstToolIndex, -1);
  assert.notEqual(secondToolIndex, -1);
  assert.equal(secondToolIndex, firstToolIndex + 1);
  assert.equal(lines.slice(firstToolIndex, secondToolIndex).includes(""), false);
});
