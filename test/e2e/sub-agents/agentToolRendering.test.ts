import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@mariozechner/pi-tui";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { createAgentTool } from "../../../packages/extensions/src/sub-agents/tooling/createAgentTool.js";
import { applyToolExecutionSpacingPatch } from "../../../packages/pi-platform/src/applyToolExecutionSpacingPatch.js";
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
 * Creates one ToolExecutionComponent for the Agent tool.
 *
 * @param toolCallId Tool call identifier.
 * @param args Tool call arguments.
 * @param result Optional tool result.
 * @returns Tool execution component.
 */
function createAgentToolExecution(
  toolCallId: string,
  args: Record<string, unknown>,
  result: { isError: boolean; content: Array<{ type: "text"; text: string }> } | {},
): ToolExecutionComponent {
  return new ToolExecutionComponent(
    "Agent",
    toolCallId,
    args,
    undefined,
    createAgentTool() as never,
    { requestRender() {} } as never,
    process.cwd(),
  );
}

test("Agent tool renders a Tron-style call row for the Librarian agent", async () => {
  await initializePiThemes();
  applyToolExecutionSpacingPatch();
  const viewport = await renderComponentInVirtualTerminal(() => {
    const root = new Container();
    root.addChild(
      createAgentToolExecution(
        "agent-1",
        {
          prompt: "Trace history scope",
          description: "Scope /agents history",
          subagent_type: "Librarian",
          run_in_background: true,
        },
        {},
      ),
    );
    return root;
  }, 160, 8);

  const plainText = viewport.map((line) => stripAnsi(line)).join("\n");
  assert.match(plainText, /▸ Librarian/);
  assert.match(plainText, /Scope \/agents history/);
  assert.match(plainText, /\[async\]/);
});

test("Agent tool renderResult emits a Tron-style background status line", () => {
  const tool = createAgentTool();
  const resultComponent = tool.renderResult?.(
    {
      isError: false,
      content: [{ type: "text", text: "Started background subagent abc123 (Scope /agents history)" }],
    },
    {},
    {
      fg(_color: string, text: string): string {
        return text;
      },
      bold(text: string): string {
        return text;
      },
    },
  );

  assert.ok(resultComponent, "expected a rendered result component");
  const plainText = resultComponent!.render(160).join("\n");
  assert.match(plainText, /⎿\s+Started background subagent abc123/);
});
