import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@earendil-works/pi-tui";
import { ToolExecutionComponent } from "../../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { AssistantMessageComponent } from "../../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { renderSubagentTranscriptLines } from "../../../../packages/extension-core/src/sub-agents/ui/renderSubagentTranscriptLines.js";
import { renderTranscriptEntry } from "../../../../packages/extension-core/src/tron/transcript/renderTranscriptEntry.js";
import { installAssistantThinkingStyle } from "../../../../packages/extension-core/src/tron/thinking/installAssistantThinkingStyle.js";
import { registerCompactBuiltInTool } from "../../../../packages/extension-core/src/tron/compact-tool-lines/registerCompactBuiltInTool.js";
import { applyToolExecutionSpacingPatch } from "../../../../packages/pi-platform/src/applyToolExecutionSpacingPatch.js";
import { renderComponentInVirtualTerminal } from "../../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../../support/theme/initializePiThemes.js";

/**
 * Removes ANSI escape sequences from rendered terminal lines.
 *
 * @param line Rendered terminal line.
 * @returns Plain visible text.
 */
function stripAnsi(line: string): string {
  return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
  italic: (text: string) => text,
};

/**
 * Fixture transcript representing one complete assistant turn.
 */
const fixtureTranscript = [
  { role: "assistant" as const, text: "I'll read it for you.", createdAt: 2 },
  { role: "thinking" as const, text: "The user wants me to read src/index.ts.", createdAt: 3 },
  { role: "tool" as const, text: "", createdAt: 4, toolCallId: "call-1", toolName: "read", args: { path: "src/index.ts" } },
];

/**
 * Builds the Path A transcript lines for the fixture.
 *
 * @param width Terminal width.
 * @returns Rendered lines with ANSI stripped.
 */
function buildPathA(width: number): string[] {
  return renderSubagentTranscriptLines(theme as any, width, {
    transcript: fixtureTranscript,
  } as any).map(stripAnsi);
}

/**
 * Builds Path B lines by running the same fixture through the live-view
 * component layer (assistant message hook + tool execution components).
 *
 * @param width Terminal width.
 * @returns Rendered lines with ANSI stripped.
 */
async function buildPathB(width: number): Promise<string[]> {
  applyToolExecutionSpacingPatch();
  installAssistantThinkingStyle();

  // Capture the compact read tool definition.
  let readToolDef: Record<string, unknown> | undefined;
  registerCompactBuiltInTool(
    {
      registerTool(definition: Record<string, unknown>) {
        readToolDef = definition;
      },
    } as any,
    "read",
  );
  if (!readToolDef) throw new Error("read tool was not registered");

  const assistantMessage = {
    content: [
      { type: "text", text: "I'll read it for you." },
      { type: "thinking", thinking: "The user wants me to read src/index.ts." },
      { type: "toolCall", id: "call-1", name: "read", args: { path: "src/index.ts" } },
    ],
    timestamp: Date.now(),
    stopReason: "stop",
  };

  // hideThinkingBlock=true matches Path A's compact thinking label.
  const assistantComponent = new AssistantMessageComponent(assistantMessage, true);

  const viewport = await renderComponentInVirtualTerminal(() => {
    const root = new Container();
    root.addChild(assistantComponent);
    root.addChild(
      new ToolExecutionComponent(
        "read",
        "call-1",
        { path: "src/index.ts" },
        {},
        readToolDef as never,
        { requestRender() {} } as never,
        process.cwd(),
      ),
    );
    return root;
  }, width, 20);

  return viewport.map(stripAnsi);
}

test("Path A and Path B produce identical tool-call lines for a shared fixture", async () => {
  process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@earendil-works/pi-coding-agent`;
  await initializePiThemes();

  const width = 80;
  const pathA = buildPathA(width);
  const pathB = await buildPathB(width);

  // The tool call row should be identical in both paths because both
  // delegate to the shared renderTranscriptEntry module.
  const toolLineA = pathA.filter((line) => line.includes("read") && line.includes("src/index.ts"));
  const toolLineB = pathB.filter((line) => line.includes("read") && line.includes("src/index.ts"));
  assert.deepEqual(toolLineA, toolLineB);
});

test("shared renderTranscriptEntry is used by both tool renderCall and static transcript", () => {
  const toolCallId = "call-1";
  const toolName = "read";
  const args = { path: "src/index.ts" };

  // Path A via shared module
  const { renderer: staticRenderer } = renderTranscriptEntry(
    { role: "tool", toolCallId, toolName, args },
    { theme, expanded: false },
  );

  // Path B via live tool definition
  let capturedRenderCall: ((args: unknown, theme: any, context: any) => any) | undefined;
  registerCompactBuiltInTool(
    {
      registerTool(definition: any) {
        capturedRenderCall = definition.renderCall;
      },
    } as any,
    "read",
  );

  if (!capturedRenderCall) throw new Error("renderCall was not captured");

  const liveRenderer = capturedRenderCall(args, theme, {
    toolCallId,
    expanded: false,
    isError: false,
    invalidate: () => {},
  });

  const width = 80;
  const staticLines = staticRenderer.render(width).map(stripAnsi);
  const liveLines = liveRenderer.render(width).map(stripAnsi);

  assert.deepEqual(staticLines, liveLines);
});

test("shared renderTranscriptEntry produces identical thinking labels for Path A and Path B", async () => {
  process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@earendil-works/pi-coding-agent`;
  await initializePiThemes();
  installAssistantThinkingStyle();

  const width = 80;
  const thinkingText = "The user wants me to read src/index.ts.";

  // Path A via shared module
  const { renderer: staticRenderer } = renderTranscriptEntry(
    { role: "thinking", text: thinkingText },
    { theme, connectThinkingToTools: true, connectThinkingFromTool: false },
  );

  // Path B via assistant message component with hideThinkingBlock=true
  const assistantMessage = {
    content: [
      { type: "thinking", thinking: thinkingText },
      { type: "toolCall", id: "call-1", name: "read", args: { path: "src/index.ts" } },
    ],
    timestamp: Date.now(),
    stopReason: "stop",
  };

  const assistantComponent = new AssistantMessageComponent(assistantMessage, true);

  const viewport = await renderComponentInVirtualTerminal(() => {
    return assistantComponent;
  }, width, 10);

  const pathBLines = viewport.map(stripAnsi);
  const pathALines = staticRenderer.render(width).map(stripAnsi);

  // Extract the thinking label lines from Path B (look for the thinking preview text).
  const pathBThinkingLines = pathBLines.filter((line) => line.includes("The user wants me to read"));
  const pathAThinkingLines = pathALines.filter((line) => line.includes("The user wants me to read"));

  assert.deepEqual(pathBThinkingLines, pathAThinkingLines);
});
