import assert from "node:assert/strict";
import test from "node:test";
import { renderSubagentTranscriptLines } from "../../../src/extensions/sub-agents/ui/renderSubagentTranscriptLines.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

test("renderSubagentTranscriptLines uses real Tron theme chrome for tool entries", async () => {
  process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@mariozechner/pi-coding-agent`;
  await initializePiThemes();

  const lines = renderSubagentTranscriptLines(createTestTheme() as never, 120, {
    id: "run-1",
    title: "[sub] Review package.json setup",
    prompt: "Review package.json setup",
    cwd: "/tmp/project",
    subagentType: "Explore",
    status: "completed",
    background: false,
    createdAt: 1,
    resultText: "",
    liveAssistantText: "",
    liveThinkingText: "",
    activeTool: null,
    transcript: [
      { role: "tool", text: "", createdAt: 2, toolCallId: "call-1", toolName: "read", args: { path: "package.json" } },
    ],
    client: null,
    toolCalls: 1,
    contextProviderIds: [],
  } as never);

  const output = lines.join("\n");
  assert.match(output, /read/);
  assert.match(output, /package\.json/);
  assert.equal(lines.some((line) => line.trimStart().startsWith("┌")), true);
  assert.equal(lines.some((line) => line.trimStart().startsWith("└")), true);
});
