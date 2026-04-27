import assert from "node:assert/strict";
import test from "node:test";
import { Container } from "@mariozechner/pi-tui";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { renderSummary } from "../../../packages/extensions/src/tron/compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../../../packages/extensions/src/tron/compact-tool-lines/summarizeArgs.js";
import { applyToolExecutionSpacingPatch } from "../../../packages/pi-platform/src/applyToolExecutionSpacingPatch.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";

/**
 * Removes ANSI escape sequences from rendered terminal lines.
 *
 * @param line Rendered terminal line.
 * @returns Plain visible text.
 */
function stripAnsi(line: string): string {
  return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

test("tron write tool renders the content preview using dim param styling", async () => {
  applyToolExecutionSpacingPatch();
  const viewport = await renderComponentInVirtualTerminal(() => {
    const root = new Container();
    const toolExecution = new ToolExecutionComponent(
      "write",
      "write-1",
      {
        path: "src/features/bots/new/page.tsx",
        content: 'import { DashboardPage } from "@/features/dashboard/components/dashboard-page"\n\nexport default function Page() {}',
      },
      {},
      {
        skipLeadingSpacer: true,
        renderShell: "self",
        renderCall(args: { path: string; content: string }) {
          return renderSummary(
            "write-1",
            "write",
            summarizeArgs("write", args),
            {
              fg(color: string, value: string): string {
                return color === "dim" ? `[dim]${value}[/dim]` : value;
              },
              bold(value: string): string {
                return value;
              },
            },
            false,
          );
        },
      } as never,
      { requestRender() {} } as never,
    process.cwd(),
    );

    root.addChild(toolExecution);
    return root;
  }, 160, 8);

  const rawLine = viewport.find((line) => line.includes("src/features/bots/new/page.tsx"));
  assert.ok(rawLine, "expected rendered write tool line");
  assert.match(rawLine, /\[dim\]import \{ DashboardPage \} from/);

  const plainLine = stripAnsi(rawLine!);
  assert.match(plainLine, /write .*src\/features\/bots\/new\/page\.tsx .*import \{ DashboardPage \} from/);
});
