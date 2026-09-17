import type { AssistantMessage } from "@earendil-works/pi-ai";
import { AssistantMessageComponent, ToolExecutionComponent, type ToolDefinition } from "@earendil-works/pi-coding-agent";
import { Text, stripTerminalSequences, visibleWidth, type MarkdownTheme, type TUI } from "@earendil-works/pi-tui";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setAssistantMessageUpdateHook } from "../../packages/pi-platform/src/assistantMessageHook";
import { resetAssistantActivityGrouping } from "../../packages/extension-core/tron/src/activity/resetAssistantActivityGrouping";
import { syncToolCallFrameState } from "../../packages/extension-core/tron/src/activity/syncToolCallFrameState";
import { bridgedToolCallIds, toolCallFrameSyncedIds } from "../../packages/extension-core/tron/src/activity/state";
import { createCompactToolDefinition } from "../../packages/extension-core/tron/src/compact-tool-lines/createCompactToolDefinition";
import { installAssistantThinkingStyle } from "../../packages/extension-core/tron/src/thinking/installAssistantThinkingStyle";

const identity = (value: string) => value;
const theme = { fg: (_: string, value: string) => value, bg: (_: string, value: string) => value, bold: identity, italic: identity };
const markdownTheme: MarkdownTheme = {
  heading: identity, link: identity, linkUrl: identity, code: identity, codeBlock: identity,
  codeBlockBorder: identity, quote: identity, quoteBorder: identity, hr: identity,
  listBullet: identity, bold: identity, italic: identity, strikethrough: identity, underline: identity,
};
const WIDTH = 90;
const sequences = [
  ["Agent"],
  ["SubagentWorkflow", "Agent", "SubagentWorkflow"],
  ["read", "Agent", "SubagentWorkflow"],
  ["SubagentWorkflow", "read", "Agent"],
  ["Agent", "read", "SubagentWorkflow"],
  ["Agent", "SubagentWorkflow", "read"],
];
function calls(names: string[]): Extract<AssistantMessage["content"][number], { type: "toolCall" }>[] {
  return names.map((name, i) => ({ type: "toolCall", name, id: `call-${i}`, arguments: { path: "file.ts" } }));
}
function message(content: AssistantMessage["content"]): AssistantMessage {
  return { role: "assistant", content, stopReason: "toolUse", timestamp: 1 } as AssistantMessage;
}
function renderTools(blocks: ReturnType<typeof calls>, expanded: boolean): string[] {
  return blocks.flatMap(block => {
    const definition: ToolDefinition = {
      name: block.name, label: block.name, description: "frame fixture", parameters: {} as never,
      execute: async () => ({ content: [], details: undefined }),
      renderCall: () => new Text(`${block.name} task ${block.id}`, 0, 0),
      renderResult: () => new Text(`${block.name} progress ${block.id}`, 0, 0),
    };
    const row = new ToolExecutionComponent(block.name, block.id, block.arguments, {},
      createCompactToolDefinition(definition), { requestRender() {} } as unknown as TUI, process.cwd());
    row.setExpanded(expanded);
    row.updateResult({ content: [{ type: "text", text: "result" }], details: undefined, isError: false });
    return row.render(WIDTH).map(stripTerminalSequences).filter(line => line.trim());
  });
}
function assertOneFrame(lines: string[]) {
  expect(lines.filter(line => /^┌─+┐$/.test(line))).toHaveLength(1);
  expect(lines.filter(line => /^└─+┘$/.test(line))).toHaveLength(1);
  expect(lines[0]).toMatch(/^┌─+┐$/);
  expect(lines.at(-1)).toMatch(/^└─+┘$/);
  expect(lines.every(line => visibleWidth(line) === WIDTH)).toBe(true);
}

beforeEach(() => {
  resetAssistantActivityGrouping();
  (globalThis as Record<symbol, unknown>)[Symbol.for("@earendil-works/pi-coding-agent:theme")] = theme;
});
afterEach(() => {
  setAssistantMessageUpdateHook(undefined);
  resetAssistantActivityGrouping();
});

describe.each([false, true])("real Agent frame synchronization (expanded=%s)", expanded => {
  it.each(sequences.map(names => [names.join(" / "), names] as const))("shares a single frame: %s", (_label, names) => {
    const blocks = calls([...names]);
    syncToolCallFrameState(blocks);
    expect([...toolCallFrameSyncedIds]).toEqual(blocks.map(block => block.id));
    const lines = renderTools(blocks, expanded);
    assertOneFrame(lines);
    for (const block of blocks.filter(block => block.name !== "read")) {
      expect(lines.join("\n")).toContain(`${block.name} progress ${block.id}`);
    }
  });

  describe.each(["text", "thinking"] as const)("assistant %s bridge", kind => {
    it.each(sequences.map(names => [names.join(" / "), names] as const))("connects through real assistant hook: %s", (_label, names) => {
      installAssistantThinkingStyle();
      const blocks = calls([...names]);
      const lead = kind === "text" ? { type: "text" as const, text: "Delegating work" }
        : { type: "thinking" as const, thinking: "Inspect carefully" };
      const assistant = new AssistantMessageComponent(message([lead, ...blocks]), true, markdownTheme);
      expect((assistant as unknown as { hasToolCalls: boolean }).hasToolCalls).toBe(true);
      expect([...toolCallFrameSyncedIds]).toEqual(blocks.map(block => block.id));
      expect([...bridgedToolCallIds]).toEqual(blocks.map(block => block.id));
      const assistantLines = assistant.render(WIDTH).map(stripTerminalSequences).filter(line => line.trim());
      expect(assistantLines.at(-1)).toMatch(/^├─+┤$/);
      const toolLines = renderTools(blocks, expanded);
      expect(toolLines.some(line => line.startsWith("┌"))).toBe(false);
      assertOneFrame([...assistantLines, ...toolLines]);
    });
  });

  it("recognizes Agent before subsequent thinking in the real assistant hook", () => {
    installAssistantThinkingStyle();
    const blocks = calls(["Agent"]);
    const assistant = new AssistantMessageComponent(message([
      ...blocks, { type: "thinking", thinking: "Review the answer" },
    ]), true, markdownTheme);
    expect((assistant as unknown as { hasToolCalls: boolean }).hasToolCalls).toBe(true);
    const lines = assistant.render(WIDTH).map(stripTerminalSequences).filter(line => line.trim());
    // Preserve the existing thinking layout: it emits the previous-tool closing
    // wall only when the preceding tool is recognized as visible.
    expect(lines[0]).toMatch(/^└─+┘$/);
    expect(lines[1]).toMatch(/^┌─+┐$/);
    expect(renderTools(blocks, expanded).join("\n")).toContain("Agent progress");
  });
});
