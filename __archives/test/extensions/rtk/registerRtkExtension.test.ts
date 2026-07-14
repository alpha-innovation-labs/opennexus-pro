import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { registerRtkExtension } from "../../../packages/extensions-pro/src/rtk/registerRtkExtension.js";
import { getRtkDefaultInstallPath } from "../../../packages/extensions-pro/src/rtk/runtime/getRtkDefaultInstallPath.js";
import { clearRtkRuntimeForCwd, getRtkRuntimeForCwd } from "../../../packages/extensions-pro/src/rtk/runtime/runtimeStore.js";
import { getBuiltInTools } from "../../../packages/extension-core/src/tron/compact-tool-lines/getBuiltInTools.js";

/**
 * Creates a minimal RTK extension harness for registration and runtime tests.
 *
 * @returns Registered handlers, tools, and exec call history.
 */
function createRtkHarness(harnessOptions: { missingPathRtk?: boolean } = {}): {
  handlers: Map<string, (event: unknown, ctx: { cwd: string; signal?: AbortSignal }) => Promise<void> | void>;
  tools: Map<string, { execute: (...args: unknown[]) => Promise<unknown> }>;
  calls: Array<{ command: string; args: string[]; cwd?: string }>;
} {
  const handlers = new Map<string, (event: unknown, ctx: { cwd: string; signal?: AbortSignal }) => Promise<void> | void>();
  const tools = new Map<string, { execute: (...args: unknown[]) => Promise<unknown> }>();
  const calls: Array<{ command: string; args: string[]; cwd?: string }> = [];
  let installed = false;

  registerRtkExtension({
    on(event: string, handler: (event: unknown, ctx: { cwd: string; signal?: AbortSignal }) => Promise<void> | void) {
      handlers.set(event, handler);
    },
    registerTool(tool: { name: string; execute: (...args: unknown[]) => Promise<unknown> }) {
      tools.set(tool.name, tool);
    },
    registerCommand() {
      return undefined;
    },
    async exec(command: string, args: string[], options?: { cwd?: string; signal?: AbortSignal }) {
      calls.push({ command, args, cwd: options?.cwd });

      if (command === "sh") {
        installed = true;
        return { code: 0, stdout: "installed\n", stderr: "" };
      }

      if (command !== "rtk" && command !== getRtkDefaultInstallPath()) {
        return { code: 0, stdout: "", stderr: "" };
      }

      if (harnessOptions.missingPathRtk && command === "rtk") {
        return { code: 127, stdout: "", stderr: "command not found" };
      }
      if (harnessOptions.missingPathRtk && command === getRtkDefaultInstallPath() && !installed) {
        return { code: 127, stdout: "", stderr: "command not found" };
      }

      switch (args[0]) {
        case "--version":
          return { code: 0, stdout: "rtk 0.23.0\n", stderr: "" };
        case "rewrite":
          return { code: 3, stdout: "git status --short\n", stderr: "" };
        case "read":
          return {
            code: 0,
            stdout:
              "1 │ alpha\n" +
              "2 │ beta\n" +
              "3 │ gamma\n" +
              "4 │ delta\n" +
              "5 │ epsilon\n" +
              "6 │ zeta\n" +
              "7 │ eta\n" +
              "8 │ theta\n" +
              "9 │ iota\n" +
              "10 │ kappa\n" +
              "11 │ lambda\n",
            stderr: "",
          };
        case "find":
          return { code: 0, stdout: "2F 2D:\n\n./ file.txt\nsrc/index.ts\nextra.ts\n", stderr: "" };
        case "ls":
          return { code: 0, stdout: "alpha/\nbeta/\ngamma/\n", stderr: "" };
        case "grep":
          return { code: 0, stdout: "1 matches in 1F:\n\n[file] /tmp/file.txt (1):\n     2: beta\n", stderr: "" };
        default:
          return { code: 0, stdout: "", stderr: "" };
      }
    },
  } as never);

  return { handlers, tools, calls };
}

test("RTK extension registers RTK-backed tools and rewrites bash commands", async () => {
  await withRtkSession(async ({ cwd, handlers, tools, calls }) => {
    const startHandler = handlers.get("session_start");
    const bashHandler = handlers.get("tool_call");

    assert.ok(startHandler);
    assert.ok(bashHandler);
    assert.ok(tools.get("read"));
    assert.ok(tools.get("find"));
    assert.ok(tools.get("ls"));
    assert.ok(tools.get("grep"));
    assert.ok(tools.get("bash"));

    await startHandler?.({}, { cwd });

    assert.ok(getRtkRuntimeForCwd(cwd));
    assert.deepEqual(calls[0], { command: "rtk", args: ["--version"], cwd });

    const bashEvent = { toolName: "bash", input: { command: "git status" } };
    await bashHandler?.(bashEvent, { cwd });

    assert.equal((bashEvent.input as { command: string }).command, "git status --short");
    assert.deepEqual(calls.at(-1), { command: "rtk", args: ["rewrite", "git status"], cwd });
  });
});

/**
 * RTK tools should not throw when tool execution context is missing.
 */
test("RTK extension prepares environment when RTK is missing from PATH", async () => {
  await withRtkSession(async ({ cwd, handlers, calls }) => {
    await handlers.get("session_start")?.({}, { cwd });

    assert.ok(getRtkRuntimeForCwd(cwd));
    assert.ok(calls.some((call) => call.command === "rtk" && call.args[0] === "--version"));
    assert.ok(calls.some((call) => call.command === "sh" && call.args.join(" ") === "-c curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh"));
    assert.deepEqual(calls.at(-1), { command: getRtkDefaultInstallPath(), args: ["--version"], cwd });
  }, { missingPathRtk: true });
});

test("RTK tools fall back cleanly when tool context is missing", async () => {
  await withRtkSession(async ({ cwd, handlers, tools, calls }) => {
    const previousCwd = process.cwd();
    const filePath = join(cwd, "one.ts");

    await writeFile(filePath, "console.log('one');\n", "utf8");
    await handlers.get("session_start")?.({}, { cwd });
    calls.length = 0;

    try {
      process.chdir(cwd);
      const findTool = tools.get("find");
      assert.ok(findTool);

      const result = (await findTool!.execute(
        "tool-find",
        { pattern: "*.ts", path: cwd, limit: 10 },
        undefined,
        undefined,
        undefined as never,
      )) as { content: Array<{ type: string; text: string }> };

      assert.match(result.content[0]?.text ?? "", /one\.ts/);
      assert.deepEqual(calls, []);
    } finally {
      process.chdir(previousCwd);
    }
  });
});

test("RTK-backed built-ins use the RTK runtime while it is active", async () => {
  await withRtkSession(async ({ cwd, handlers, calls }) => {
    const filePath = join(cwd, "doc.txt");
    await writeFile(
      filePath,
      ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda"].join("\n") + "\n",
      "utf8",
    );

    await handlers.get("session_start")?.({}, { cwd });
    calls.length = 0;

    const tools = getBuiltInTools(cwd);

    const readResult = (await tools.read.execute(
      "read-call",
      { path: filePath, offset: 2, limit: 2 },
      undefined,
      () => undefined,
    )) as { content: Array<{ type: string; text: string }> };
    assert.match(readResult.content[0]?.text ?? "", /2 │ beta/);
    assert.match(readResult.content[0]?.text ?? "", /3 │ gamma/);
    assert.match(readResult.content[0]?.text ?? "", /Use offset=4 to continue/);
    assert.deepEqual(calls[0], { command: "rtk", args: ["read", "-n", filePath, "-m", "2"], cwd });

    const findResult = (await tools.find.execute(
      "find-call",
      { pattern: "**/*.ts", path: cwd, limit: 2 },
      undefined,
      () => undefined,
    )) as { content: Array<{ type: string; text: string }> };
    assert.match(findResult.content[0]?.text ?? "", /2F 2D:/);
    assert.match(findResult.content[0]?.text ?? "", /Showing first 2 results/);
    assert.deepEqual(calls[1].args.slice(0, 3), ["find", cwd, "-path"]);

    const lsResult = (await tools.ls.execute(
      "ls-call",
      { path: cwd, limit: 2 },
      undefined,
      () => undefined,
    )) as { content: Array<{ type: string; text: string }> };
    assert.match(lsResult.content[0]?.text ?? "", /alpha\//);
    assert.match(lsResult.content[0]?.text ?? "", /Showing first 2 entries/);
    assert.deepEqual(calls[2].args, ["ls", cwd]);

    const grepResult = (await tools.grep.execute(
      "grep-call",
      { pattern: "beta", path: cwd, glob: "*.ts", ignoreCase: true, literal: true, context: 2, limit: 1 },
      undefined,
      () => undefined,
    )) as { content: Array<{ type: string; text: string }> };
    assert.match(grepResult.content[0]?.text ?? "", /beta/);
    assert.deepEqual(calls[3].args, ["grep", "beta", cwd, "-i", "-F", "--glob", "*.ts", "-C", "2", "-m", "1"]);

    clearRtkRuntimeForCwd(cwd);
    const fallbackTools = getBuiltInTools(cwd);
    const fallbackResult = (await fallbackTools.read.execute(
      "read-fallback",
      { path: filePath, offset: 1, limit: 1 },
      undefined,
      () => undefined,
    )) as { content: Array<{ type: string; text: string }> };
    assert.match(fallbackResult.content[0]?.text ?? "", /alpha/);
    assert.equal(calls.length, 4);
  });
});

/**
 * Runs the RTK tests against an isolated temporary cwd.
 *
 * @param fn RTK test body.
 */
async function withRtkSession(
  fn: (context: {
    cwd: string;
    handlers: Map<string, (event: unknown, ctx: { cwd: string; signal?: AbortSignal }) => Promise<void> | void>;
    tools: Map<string, { execute: (...args: unknown[]) => Promise<unknown> }>;
    calls: Array<{ command: string; args: string[]; cwd?: string }>;
  }) => Promise<void>,
  options: { missingPathRtk?: boolean } = {},
): Promise<void> {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-rtk-"));
  const harness = createRtkHarness(options);

  try {
    await fn({ cwd, ...harness });
  } finally {
    clearRtkRuntimeForCwd(cwd);
    await rm(cwd, { recursive: true, force: true });
  }
}
