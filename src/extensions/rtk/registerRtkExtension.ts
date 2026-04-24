import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createRtkRuntime } from "./runtime/createRtkRuntime.js";
import { getRtkExecutionCwd } from "./runtime/getRtkExecutionCwd.js";
import { clearRtkRuntimeForCwd, getRtkRuntimeForCwd, setRtkRuntimeForCwd } from "./runtime/runtimeStore.js";
import { hasRtkBinary } from "./runtime/hasRtkBinary.js";
import { createRtkBashTool } from "./tooling/createRtkBashTool.js";
import { createRtkFindTool } from "./tooling/createRtkFindTool.js";
import { createRtkGrepTool } from "./tooling/createRtkGrepTool.js";
import { createRtkLsTool } from "./tooling/createRtkLsTool.js";
import { createRtkReadTool } from "./tooling/createRtkReadTool.js";

/**
 * Registers the RTK extension surface.
 *
 * @param pi Pi extension API.
 */
export function registerRtkExtension(pi: ExtensionAPI): void {
  pi.registerTool(createRtkReadTool());
  pi.registerTool(createRtkFindTool());
  pi.registerTool(createRtkLsTool());
  pi.registerTool(createRtkGrepTool());
  pi.registerTool(createRtkBashTool());

  pi.on("session_start", async (_event, ctx) => {
    const cwd = getRtkExecutionCwd(ctx);
    const available = await hasRtkBinary(pi, cwd, ctx?.signal);
    if (!available) {
      clearRtkRuntimeForCwd(cwd);
      console.warn("[rtk] rtk binary not found in PATH — extension falls back to base tools");
      return;
    }

    setRtkRuntimeForCwd(cwd, createRtkRuntime(pi));
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    clearRtkRuntimeForCwd(getRtkExecutionCwd(ctx));
  });

  pi.on("tool_call", async (event, ctx) => {
    const toolName = String((event as { toolName?: unknown }).toolName ?? "").toLowerCase();
    if (toolName !== "bash" && toolName !== "shell") {
      return;
    }

    const input = (event as { input?: { command?: unknown } }).input;
    if (!input || typeof input.command !== "string" || !input.command) {
      return;
    }

    const runtime = getRtkRuntimeForCwd(getRtkExecutionCwd(ctx));
    if (!runtime) {
      return;
    }

    try {
      const command = input.command;
      const result = await runtime.exec("rewrite", [command], { cwd: getRtkExecutionCwd(ctx), signal: ctx.signal });
      const rewritten = result.code === 0 ? result.stdout.trim() : "";
      if (rewritten && rewritten !== command) {
        input.command = rewritten;
      }
    } catch {
      // RTK rewrite failed — let the original command run unchanged.
    }
  });
}
