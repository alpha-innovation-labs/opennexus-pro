import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { registerSavingsCommand } from "../../../packages/extensions/src/rtk/command/registerSavingsCommand.js";

test("registerSavingsCommand renders usage, RTK savings, and OpenRouter costs", async () => {
  const sessionRoot = await mkdtemp(join(tmpdir(), "nexus-savings-"));
  const previousRoot = process.env.NEXUS_SESSION_ROOT;
  const previousFetch = globalThis.fetch;
  process.env.NEXUS_SESSION_ROOT = sessionRoot;
  globalThis.fetch = async () => ({
    json: async () => ({ data: [{ id: "openai/gpt-5.5", pricing: { completion: "0.00003", input_cache_read: "0.0000005", prompt: "0.000005" } }] }),
  }) as Response;

  const commands = new Map<string, { handler(args: string[], ctx: unknown): Promise<void> }>();
  const renderedModalLines: string[][] = [];
  const execCalls: Array<{ command: string; args: string[] }> = [];
  await writeFile(join(sessionRoot, "usage.jsonl"), `${JSON.stringify({
    message: { model: "gpt-5.5", usage: { cacheRead: 3000, cacheWrite: 0, input: 1000, output: 500, totalTokens: 4500 } },
    timestamp: "2026-04-27T01:00:00.000Z",
    type: "message",
  })}\n`);
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

  try {
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
  } finally {
    if (previousRoot === undefined) delete process.env.NEXUS_SESSION_ROOT;
    else process.env.NEXUS_SESSION_ROOT = previousRoot;
    globalThis.fetch = previousFetch;
    await rm(sessionRoot, { force: true, recursive: true });
  }

  const output = renderedModalLines[0]?.join("\n") ?? "";
  assert.deepEqual(execCalls, [{ command: "rtk", args: ["gain", "--daily", "--weekly", "--monthly", "--format", "json"] }]);
  assert.match(output, /Token Savings/u);
  assert.doesNotMatch(output, /RTK Token Savings/u);
  assert.match(output, /Total input\s+1k/u);
  assert.match(output, /Cached input\s+3k/u);
  assert.match(output, /Nexus input saved\s+750/u);
  assert.match(output, /OpenRouter openai\/gpt-5\.5 \(m\)/u);
  assert.match(output, /Cached cost\s+\$0\.00\s+│\n.*─/u);
  assert.match(output, /Total cost\s+\$0\.02/u);
  assert.match(output, /Nexus \$ saved\s+\$0\.00/u);
});
