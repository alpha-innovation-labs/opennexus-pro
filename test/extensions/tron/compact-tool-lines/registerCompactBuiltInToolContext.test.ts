import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { registerRtkExtension } from "../../../../src/extensions/rtk/registerRtkExtension.js";
import { clearRtkRuntimeForCwd, getRtkRuntimeForCwd } from "../../../../src/extensions/rtk/runtime/runtimeStore.js";
import { registerCompactBuiltInTool } from "../../../../src/extensions/tron/compact-tool-lines/registerCompactBuiltInTool.js";

/**
 * Creates a compact built-in tool registration harness.
 *
 * @returns Registered tool definitions.
 */
function createCompactToolHarness(): { tool: { execute: (...args: unknown[]) => Promise<unknown> } | undefined } {
  let tool: { execute: (...args: unknown[]) => Promise<unknown> } | undefined;
  registerCompactBuiltInTool(
    {
      registerTool(nextTool: { execute: (...args: unknown[]) => Promise<unknown> }) {
        tool = nextTool;
      },
    } as never,
    "find",
  );
  return { tool };
}

/**
 * Creates a tiny RTK registration harness for compact tool tests.
 *
 * @returns Event handlers and exec call log.
 */
function createRtkRegistrationHarness(): {
  handlers: Map<string, (event: unknown, ctx: { cwd: string; signal?: AbortSignal }) => Promise<void> | void>;
  calls: Array<{ command: string; args: string[]; cwd?: string }>;
} {
  const handlers = new Map<string, (event: unknown, ctx: { cwd: string; signal?: AbortSignal }) => Promise<void> | void>();
  const calls: Array<{ command: string; args: string[]; cwd?: string }> = [];

  registerRtkExtension({
    on(event: string, handler: (event: unknown, ctx: { cwd: string; signal?: AbortSignal }) => Promise<void> | void) {
      handlers.set(event, handler);
    },
    registerTool() {
      return undefined;
    },
    async exec(command: string, args: string[], options?: { cwd?: string; signal?: AbortSignal }) {
      calls.push({ command, args, cwd: options?.cwd });

      if (command !== "rtk") {
        return { code: 0, stdout: "", stderr: "" };
      }

      switch (args[0]) {
        case "--version":
          return { code: 0, stdout: "rtk 0.23.0\n", stderr: "" };
        case "find":
          return { code: 0, stdout: "2F 2D:\n\n./ one.ts\n", stderr: "" };
        default:
          return { code: 0, stdout: "", stderr: "" };
      }
    },
  } as never);

  return { handlers, calls };
}

/**
 * Ensures compact built-in tools can execute through RTK even when ctx is missing.
 */
test("compact built-in tools keep RTK execution when ctx is missing", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-rtk-compact-"));
  const filePath = join(cwd, "one.ts");
  const { handlers, calls } = createRtkRegistrationHarness();
  const { tool } = createCompactToolHarness();

  assert.ok(tool);

  await writeFile(filePath, "export const one = 1;\n", "utf8");

  try {
    await handlers.get("session_start")?.({}, { cwd });
    assert.ok(getRtkRuntimeForCwd(cwd));

    const result = (await tool.execute(
      "tool-find",
      { pattern: "*.ts", path: cwd, limit: 10 },
      undefined,
      undefined,
      undefined as never,
    )) as { content?: Array<{ type: string; text: string }> };

    assert.match(result.content?.[0]?.text ?? "", /one\.ts/);
    assert.deepEqual(calls[0], { command: "rtk", args: ["--version"], cwd });
    assert.deepEqual(calls[1], { command: "rtk", args: ["find", cwd, "-name", "*.ts"], cwd });
  } finally {
    clearRtkRuntimeForCwd(cwd);
    await rm(cwd, { recursive: true, force: true });
  }
});
