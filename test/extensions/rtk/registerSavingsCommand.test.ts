import assert from "node:assert/strict";
import test from "node:test";
import { registerSavingsCommand } from "../../../packages/extensions/src/rtk/command/registerSavingsCommand.js";

test("registerSavingsCommand runs rtk gain using JSON output and opens a savings modal", async () => {
  const commands = new Map<string, { handler(args: string[], ctx: unknown): Promise<void> }>();
  const renderedModalLines: string[][] = [];
  const execCalls: Array<{ command: string; args: string[] }> = [];
  const pi = {
    registerCommand(name: string, definition: { handler(args: string[], ctx: unknown): Promise<void> }) {
      commands.set(name, definition);
    },
    async exec(command: string, args: string[]) {
      execCalls.push({ command, args });
      return {
        code: 0,
        stdout: JSON.stringify({
          daily: [{ commands: 2, input_tokens: 1000, output_tokens: 250, saved_tokens: 750, savings_pct: 75, total_time_ms: 20, avg_time_ms: 10, date: "2026-04-27" }],
          summary: {
            total_commands: 2,
            total_input: 1000,
            total_output: 250,
            total_saved: 750,
            avg_savings_pct: 75,
            total_time_ms: 20,
            avg_time_ms: 10,
          },
        }),
        stderr: "",
      };
    },
  };

  registerSavingsCommand(pi as never);
  await commands.get("savings")?.handler([], {
    cwd: process.cwd(),
    hasUI: true,
    signal: undefined,
    ui: {
      async custom(factory: (tui: unknown, theme: { fg(_color: string, value: string): string }, keybindings: unknown, done: () => void) => { render(width: number): string[] }) {
        const modal = factory({}, { fg: (_color: string, value: string) => value }, {}, () => undefined);
        renderedModalLines.push(modal.render(100));
      },
      notify() {},
    },
  });

  assert.deepEqual(execCalls, [{ command: "rtk", args: ["gain", "--daily", "--weekly", "--monthly", "--format", "json"] }]);
  assert.match(renderedModalLines[0]?.join("\n") ?? "", /Token Savings/u);
  assert.doesNotMatch(renderedModalLines[0]?.join("\n") ?? "", /RTK Token Savings/u);
  assert.match(renderedModalLines[0]?.join("\n") ?? "", /Daily saved\s+750/u);
});
