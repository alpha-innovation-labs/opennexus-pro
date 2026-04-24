import { createBashTool } from "@mariozechner/pi-coding-agent";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore.js";

/**
 * Creates the RTK-backed bash tool.
 *
 * @returns RTK-aware bash tool definition.
 */
export function createRtkBashTool(cwd = process.cwd(), useProcessCwdFallback = true) {
  const template = createBashTool(cwd);

  return {
    ...template,
    async execute(toolCallId: string, params: Parameters<typeof template.execute>[1], signal?: AbortSignal, onUpdate?: Parameters<typeof template.execute>[3], ctx?: { cwd?: string }) {
      const executionCwd = ctx?.cwd ?? (useProcessCwdFallback ? process.cwd() : cwd);
      const original = createBashTool(executionCwd);
      const runtime = getRtkRuntimeForCwd(executionCwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate);
      }

      const input = params as { command: string };

      try {
        const rewrite = await runtime.exec("rewrite", [input.command], { cwd: executionCwd, signal });
        const rewritten = rewrite.stdout.trim();
        const command = rewritten && rewritten !== input.command ? rewritten : input.command;

        return original.execute(
          toolCallId,
          { ...params, command },
          signal,
          onUpdate,
        );
      } catch {
        return original.execute(toolCallId, params, signal, onUpdate);
      }
    },
  };
}
