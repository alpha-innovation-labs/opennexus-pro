import { createBashTool } from "@mariozechner/pi-coding-agent";
import { getRtkExecutionCwd } from "../runtime/getRtkExecutionCwd.js";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore.js";

/**
 * Creates the RTK-backed bash tool.
 *
 * @returns RTK-aware bash tool definition.
 */
export function createRtkBashTool() {
  const template = createBashTool(process.cwd());

  return {
    ...template,
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const cwd = getRtkExecutionCwd(ctx);
      const original = createBashTool(cwd);
      const runtime = getRtkRuntimeForCwd(cwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }

      const input = params as { command: string };

      try {
        const rewrite = await runtime.exec("rewrite", [input.command], { cwd, signal });
        const rewritten = rewrite.stdout.trim();
        const command = rewritten && rewritten !== input.command ? rewritten : input.command;

        return original.execute(
          toolCallId,
          { ...params, command },
          signal,
          onUpdate,
          ctx,
        );
      } catch {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }
    },
  };
}
