import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@mariozechner/pi-tui";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { renderSummary } from "../../../src/extensions/tron/compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../../../src/extensions/tron/compact-tool-lines/summarizeArgs.js";
import { installAssistantThinkingStyle } from "../../../src/extensions/tron/thinking/installAssistantThinkingStyle.js";
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

/**
 * Creates a compact tool execution component for Tron spacing checks.
 *
 * @param toolCallId Tool call id.
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @returns Tool execution component.
 */
function createToolExecutionComponent(toolCallId: string, toolName: string, args: Record<string, unknown>): ToolExecutionComponent {
  return new ToolExecutionComponent(
    toolName,
    toolCallId,
    args,
    {},
    {
      skipLeadingSpacer: true,
      renderShell: "self",
      renderCall(callArgs: Record<string, unknown>, theme: unknown) {
        return renderSummary(toolCallId, toolName, summarizeArgs(toolName, callArgs), theme, false);
      },
    } as never,
    { requestRender() {} } as never,
    process.cwd(),
  );
}

test("tron multi-group tool timeline renders without blank rows between groups", async () => {
  await initializePiThemes();
  applyToolExecutionSpacingPatch();
  installAssistantThinkingStyle();

  const viewport = await renderComponentInVirtualTerminal(() => {
    const root = new Container();

    root.addChild(
      new AssistantMessageComponent(
        {
          role: "assistant",
          content: [
            { type: "thinking", thinking: "I need to inspect the external repository first." },
            { type: "toolCall", id: "read-1", name: "read", arguments: { path: "~/.agents/skills/agent-browser/SKILL.md" } },
          ],
        } as never,
        true,
      ),
    );
    root.addChild(createToolExecutionComponent("read-1", "read", { path: "~/.agents/skills/agent-browser/SKILL.md" }));

    root.addChild(
      new AssistantMessageComponent(
        {
          role: "assistant",
          content: [
            { type: "toolCall", id: "bash-1", name: "bash", arguments: { command: "rm -rf /tmp/pi-subagents && git clone --depth 1 https://github.com/example/repo", timeout: 60 } },
            { type: "toolCall", id: "bash-2", name: "bash", arguments: { command: "python - <<'PY'", timeout: 60 } },
          ],
        } as never,
        true,
      ),
    );
    root.addChild(createToolExecutionComponent("bash-1", "bash", { command: "rm -rf /tmp/pi-subagents && git clone --depth 1 https://github.com/example/repo", timeout: 60 }));
    root.addChild(createToolExecutionComponent("bash-2", "bash", { command: "python - <<'PY'", timeout: 60 }));

    root.addChild(
      new AssistantMessageComponent(
        {
          role: "assistant",
          content: [
            { type: "toolCall", id: "ls-1", name: "ls", arguments: { path: "/tmp/pi-subagents", limit: 200 } },
            { type: "toolCall", id: "find-1", name: "find", arguments: { path: "/tmp/pi-subagents", pattern: "**/*", limit: 300 } },
          ],
        } as never,
        true,
      ),
    );
    root.addChild(createToolExecutionComponent("ls-1", "ls", { path: "/tmp/pi-subagents", limit: 200 }));
    root.addChild(createToolExecutionComponent("find-1", "find", { path: "/tmp/pi-subagents", pattern: "**/*", limit: 300 }));

    root.addChild(
      new AssistantMessageComponent(
        {
          role: "assistant",
          content: [
            { type: "toolCall", id: "read-2", name: "read", arguments: { path: "/tmp/pi-subagents/README.md", offset: 1, limit: 260 } },
            { type: "toolCall", id: "read-3", name: "read", arguments: { path: "/tmp/pi-subagents/pi-spawn.ts", offset: 1, limit: 260 } },
          ],
        } as never,
        true,
      ),
    );
    root.addChild(createToolExecutionComponent("read-2", "read", { path: "/tmp/pi-subagents/README.md", offset: 1, limit: 260 }));
    root.addChild(createToolExecutionComponent("read-3", "read", { path: "/tmp/pi-subagents/pi-spawn.ts", offset: 1, limit: 260 }));

    return root;
  }, 150, 30);

  const plainLines = viewport.map((line) => stripAnsi(line));
  const groupStarts = [
    plainLines.findIndex((line) => line.includes("read") && line.includes("agent-browser/SKILL.md")),
    plainLines.findIndex((line) => line.includes("bash") && line.includes("rm -rf /tmp/pi-subagents")),
    plainLines.findIndex((line) => line.includes("ls") && line.includes("/tmp/pi-subagents")),
    plainLines.findIndex((line) => line.includes("read") && line.includes("/tmp/pi-subagents/README.md")),
  ];

  for (const startIndex of groupStarts) {
    assert.notEqual(startIndex, -1);
    assert.notEqual(plainLines[startIndex]?.trim(), "");
  }
  for (let index = 1; index < groupStarts.length; index += 1) {
    assert.notEqual(plainLines[groupStarts[index] - 1]?.trim(), "");
  }
});
